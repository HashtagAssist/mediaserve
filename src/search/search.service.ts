import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, In, Between } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';

export interface SearchOptions {
  query?: string;
  type?: 'movie' | 'music' | string[];
  genres?: string[];
  year?: number | { min?: number; max?: number };
  duration?: { min?: number; max?: number };
  libraryId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SearchResult {
  items: Media[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private logger: LoggerService,
  ) {}

  async search(options: SearchOptions): Promise<SearchResult> {
    this.logger.debug(`Starte Suche mit Optionen: ${JSON.stringify(options)}`, 'SearchService');
    
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    
    // Erstelle die Basis-Query
    const queryBuilder = this.mediaRepository.createQueryBuilder('media')
      .leftJoinAndSelect('media.library', 'library');
    
    // Füge Suchbedingungen hinzu
    if (options.query) {
      queryBuilder.andWhere(
        '(media.title ILIKE :query OR media.description ILIKE :query)',
        { query: `%${options.query}%` }
      );
    }
    
    // Filtere nach Medientyp
    if (options.type) {
      if (Array.isArray(options.type)) {
        queryBuilder.andWhere('media.type IN (:...types)', { types: options.type });
      } else {
        queryBuilder.andWhere('media.type = :type', { type: options.type });
      }
    }
    
    // Filtere nach Genres
    if (options.genres && options.genres.length > 0) {
      // Da Genres als Array in der Datenbank gespeichert sind, müssen wir eine spezielle Abfrage verwenden
      // Für PostgreSQL können wir den ARRAY-Operator verwenden
      queryBuilder.andWhere('media.genres && ARRAY[:...genres]', { genres: options.genres });
    }
    
    // Filtere nach Jahr
    if (options.year) {
      if (typeof options.year === 'number') {
        queryBuilder.andWhere('media.year = :year', { year: options.year });
      } else {
        if (options.year.min !== undefined) {
          queryBuilder.andWhere('media.year >= :minYear', { minYear: options.year.min });
        }
        if (options.year.max !== undefined) {
          queryBuilder.andWhere('media.year <= :maxYear', { maxYear: options.year.max });
        }
      }
    }
    
    // Filtere nach Dauer
    if (options.duration) {
      if (options.duration.min !== undefined) {
        queryBuilder.andWhere('media.duration >= :minDuration', { minDuration: options.duration.min });
      }
      if (options.duration.max !== undefined) {
        queryBuilder.andWhere('media.duration <= :maxDuration', { maxDuration: options.duration.max });
      }
    }
    
    // Filtere nach Bibliothek
    if (options.libraryId) {
      queryBuilder.andWhere('library.id = :libraryId', { libraryId: options.libraryId });
    }
    
    // Sortierung
    const sortBy = options.sortBy || 'title';
    const sortOrder = options.sortOrder || 'ASC';
    queryBuilder.orderBy(`media.${sortBy}`, sortOrder);
    
    // Paginierung
    queryBuilder.skip(offset).take(limit);
    
    // Führe die Abfrage aus
    const [items, total] = await queryBuilder.getManyAndCount();
    
    const totalPages = Math.ceil(total / limit);
    
    this.logger.debug(
      `Suche abgeschlossen: ${items.length} Ergebnisse von insgesamt ${total}`,
      'SearchService'
    );
    
    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }

  async suggest(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    this.logger.debug(`Starte Vorschläge für Query: ${query}`, 'SearchService');
    
    // Suche nach Titeln, die mit der Abfrage beginnen
    const titles = await this.mediaRepository.find({
      select: ['title'],
      where: { title: ILike(`${query}%`) },
      take: limit,
    });
    
    // Suche nach Genres, die mit der Abfrage beginnen
    const genreResults = await this.mediaRepository
      .createQueryBuilder('media')
      .select('unnest(media.genres)', 'genre')
      .where('unnest(media.genres) ILIKE :query', { query: `${query}%` })
      .groupBy('genre')
      .take(limit)
      .getRawMany();
    
    const genres = genreResults.map(result => result.genre);
    
    // Kombiniere die Ergebnisse und entferne Duplikate
    const suggestions = [
      ...titles.map(item => item.title),
      ...genres,
    ];
    
    return [...new Set(suggestions)].slice(0, limit);
  }
} 