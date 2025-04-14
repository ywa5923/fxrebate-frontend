import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface Author {
  name: string;
  imageUrl: string;
  prefix?: string;
}

interface AuthorsProps {
  authors: Author[];
  className?: string;
  defaultPrefix?: string;
  updatedDate?: string;
  rightText?: Array<{
    text: string;
    href: string;
  }>;
}

export const Authors = ({ authors, className, defaultPrefix = "Edited by", updatedDate, rightText }: AuthorsProps) => {
  return (
    <Card className={cn("p-4 dark:bg-gray-800 dark:border-gray-700", className)}>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {authors.map((author, index) => (
            <div key={index} className="flex items-center gap-2">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage src={author.imageUrl} alt={author.name} />
                <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <b className="text-xs sm:text-sm dark:text-gray-100">{author.name}</b>
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  {author.prefix || defaultPrefix}
                </span>
              </div>
            </div>
          ))}
        </div>
        {updatedDate && (
          <div className="flex-1 flex flex-col items-start sm:items-center justify-center">
            <b className="text-sm sm:text-base dark:text-gray-100">{updatedDate}</b>
            <small className="block text-xs text-muted-foreground dark:text-gray-400">Last Updated</small>
          </div>
        )}
        {rightText && (
          <div className="w-full max-w-[200px] sm:w-[200px]">
            {rightText.map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                className="block text-xs sm:text-sm text-primary hover:text-primary/80 break-words underline underline-offset-2 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {item.text} →
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
