'use client';

import Image from 'next/image';

interface SupportedLanguagesProps {
  languages: string[];
}

const cloudflareR2Link = "https://pub-3cbdb33cc7ba41f996c3316b5dd20bbc.r2.dev/flags";

export const SupportedLanguages = ({ languages }: SupportedLanguagesProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-300">Supported Languages</h2>
      <div className="md:w-4/5 lg:w-3/5">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {languages.map((language) => {
            return (
              <div key={language} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="relative w-7 h-5 flex-shrink-0">
                  <Image
                    src={`${cloudflareR2Link}/${language.toLowerCase()}.svg`}
                    alt={`${language} flag`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl-1 text-gray-900 dark:text-gray-400">{language}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
