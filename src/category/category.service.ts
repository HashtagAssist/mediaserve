import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../media/entities/media.entity';
import { LoggerService } from '../shared/services/logger.service';
import * as path from 'path';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface CategoryRule {
  name: string;
  pattern: RegExp;
  priority: number;
}

@Injectable()
export class CategoryService {
  private readonly movieGenreRules: CategoryRule[] = [
    { name: 'Action', pattern: /\b(action|kampf|explosion|thriller)\b/i, priority: 1 },
    { name: 'Comedy', pattern: /\b(comedy|komödie|lustig|humor)\b/i, priority: 1 },
    { name: 'Drama', pattern: /\b(drama|emotional|tragödie)\b/i, priority: 1 },
    { name: 'Horror', pattern: /\b(horror|grusel|schocker|angst)\b/i, priority: 1 },
    { name: 'Sci-Fi', pattern: /\b(sci-?fi|science.?fiction|zukunft|space|weltraum)\b/i, priority: 1 },
    { name: 'Fantasy', pattern: /\b(fantasy|magie|zauberer|drachen|elfen)\b/i, priority: 1 },
    { name: 'Documentary', pattern: /\b(doku|dokumentation|documentary)\b/i, priority: 2 },
    { name: 'Animation', pattern: /\b(animation|animiert|cartoon|anime)\b/i, priority: 2 },
    { name: 'Family', pattern: /\b(family|familie|kinder|jugend)\b/i, priority: 1 },
  ];

  private readonly musicGenreRules: CategoryRule[] = [
    { name: 'Rock', pattern: /\b(rock|metal|punk|grunge)\b/i, priority: 1 },
    { name: 'Pop', pattern: /\b(pop|charts|mainstream)\b/i, priority: 1 },
    { name: 'Electronic', pattern: /\b(electro|electronic|techno|house|edm|trance)\b/i, priority: 1 },
    { name: 'Hip-Hop', pattern: /\b(hip.?hop|rap|r&b)\b/i, priority: 1 },
    { name: 'Jazz', pattern: /\b(jazz|blues|swing)\b/i, priority: 1 },
    { name: 'Classical', pattern: /\b(klassik|classical|orchestra|symphonie)\b/i, priority: 1 },
  ];

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private logger: LoggerService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.debug(
      `Erstelle neue Kategorie: ${createCategoryDto.name}`,
      'CategoryService'
    );
    
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    this.logger.debug('Rufe alle Kategorien ab', 'CategoryService');
    return this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Category> {
    this.logger.debug(`Rufe Kategorie ab: ${id}`, 'CategoryService');
    
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['media'],
    });
    
    if (!category) {
      this.logger.warn(`Kategorie ${id} nicht gefunden`, 'CategoryService');
      throw new NotFoundException(`Kategorie mit ID ${id} nicht gefunden`);
    }
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    this.logger.debug(`Aktualisiere Kategorie: ${id}`, 'CategoryService');
    
    const category = await this.findOne(id);
    
    // Aktualisiere die Eigenschaften
    Object.assign(category, updateCategoryDto);
    
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`Lösche Kategorie: ${id}`, 'CategoryService');
    
    const category = await this.findOne(id);
    
    await this.categoryRepository.remove(category);
  }

  async addMedia(categoryId: string, mediaId: string): Promise<void> {
    this.logger.debug(
      `Füge Medium ${mediaId} zur Kategorie ${categoryId} hinzu`,
      'CategoryService'
    );
    
    const category = await this.findOne(categoryId);
    
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    
    if (!media) {
      this.logger.warn(`Medium ${mediaId} nicht gefunden`, 'CategoryService');
      throw new NotFoundException(`Medium mit ID ${mediaId} nicht gefunden`);
    }
    
    if (!category.media) {
      category.media = [];
    }
    
    category.media.push(media);
    
    await this.categoryRepository.save(category);
  }

  async removeMedia(categoryId: string, mediaId: string): Promise<void> {
    this.logger.debug(
      `Entferne Medium ${mediaId} aus Kategorie ${categoryId}`,
      'CategoryService'
    );
    
    const category = await this.findOne(categoryId);
    
    if (!category.media) {
      return;
    }
    
    category.media = category.media.filter(media => media.id !== mediaId);
    
    await this.categoryRepository.save(category);
  }

  async categorizeMedia(mediaId: string): Promise<string[]> {
    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (!media) {
      this.logger.warn(`Medium mit ID ${mediaId} nicht gefunden`, 'CategoryService');
      return [];
    }

    this.logger.debug(`Kategorisiere Medium: ${media.title}`, 'CategoryService');

    const genres = this.detectGenres(media);
    
    if (genres.length > 0) {
      media.genres = genres;
      await this.mediaRepository.save(media);
      
      this.logger.debug(
        `Medium ${media.title} kategorisiert als: ${genres.join(', ')}`,
        'CategoryService'
      );
    } else {
      this.logger.debug(
        `Keine Kategorien für Medium ${media.title} gefunden`,
        'CategoryService'
      );
    }

    return genres;
  }

  async categorizeLibrary(libraryId: string): Promise<number> {
    const media = await this.mediaRepository.find({
      where: {
        library: { id: libraryId },
        genres: null,
      },
    });

    this.logger.debug(
      `Starte Kategorisierung für ${media.length} Medien in Bibliothek ${libraryId}`,
      'CategoryService'
    );

    let categorizedCount = 0;
    for (const item of media) {
      const genres = await this.categorizeMedia(item.id);
      if (genres.length > 0) {
        categorizedCount++;
      }
    }

    this.logger.debug(
      `Kategorisierung abgeschlossen: ${categorizedCount}/${media.length} erfolgreich`,
      'CategoryService'
    );

    return categorizedCount;
  }

  private detectGenres(media: Media): string[] {
    const genres = new Set<string>();
    const rules = media.type === 'movie' ? this.movieGenreRules : this.musicGenreRules;
    
    // Analysiere Dateinamen
    this.analyzeText(media.title, rules, genres);
    
    // Analysiere Pfad (Ordnerstruktur)
    if (media.relativePath) {
      const pathParts = media.relativePath.split(path.sep);
      for (const part of pathParts) {
        this.analyzeText(part, rules, genres);
      }
    }
    
    // Analysiere Beschreibung, falls vorhanden
    if (media.description) {
      this.analyzeText(media.description, rules, genres);
    }
    
    return Array.from(genres);
  }

  private analyzeText(text: string, rules: CategoryRule[], genres: Set<string>) {
    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        genres.add(rule.name);
      }
    }
  }
} 