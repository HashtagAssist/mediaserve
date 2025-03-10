'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi, libraryApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Film, Music, Library, Play, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  const { data: recentMedia, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['recentMedia'],
    queryFn: () => mediaApi.getAll().then((res) => res.data),
  });

  const { data: libraries, isLoading: isLoadingLibraries } = useQuery({
    queryKey: ['libraries'],
    queryFn: () => libraryApi.getAll().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filme</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMedia ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                recentMedia?.filter((m: any) => m.type === 'MOVIE').length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Filme in Ihrer Sammlung
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Musik</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMedia ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                recentMedia?.filter((m: any) => m.type === 'MUSIC').length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Musikstücke in Ihrer Sammlung
            </p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bibliotheken</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingLibraries ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                libraries?.length || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Konfigurierte Medienbibliotheken
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Zuletzt hinzugefügt</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoadingMedia ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            (recentMedia || []).slice(0, 8).map((media: any) => (
              <Link href={`/media/${media.id}`} key={media.id}>
                <Card className="overflow-hidden transition-all hover:scale-105">
                  <div className="aspect-video relative">
                    {media.thumbnailPath ? (
                      <Image
                        src={`/api/thumbnails/media/${media.id}`}
                        alt={media.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        {media.type === 'MOVIE' ? (
                          <Film className="h-12 w-12 text-muted-foreground" />
                        ) : (
                          <Music className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 rounded-full"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{media.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {media.releaseYear && <span>{media.releaseYear}</span>}
                      {media.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {Math.floor(media.duration / 60)}m
                          </span>
                        </div>
                      )}
                      {media.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span>{media.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 