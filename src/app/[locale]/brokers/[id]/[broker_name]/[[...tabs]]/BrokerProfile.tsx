import Image from 'next/image';

interface BrokerProfileProps {
  logoUrl: string;
  foundedYear: string;
  companyName: string;
  categories: string[];
}

export const BrokerProfile = ({ 
  logoUrl,
  foundedYear, 
  companyName, 
  categories 
}: BrokerProfileProps) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-black dark:text-white">Admiral Markets Profile</h1>
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Logo */}
        <div className="relative w-20 h-20 md:w-28 md:h-28">
          <Image
            src={logoUrl}
            alt="Admiral Markets Logo"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Funded {foundedYear}</span>
            <h2 className="text-xl font-semibold text-black dark:text-white leading-none">{companyName}</h2>
            <div className="flex flex-wrap gap-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Categories:</span>
              {categories.map((category, index) => (
                <span
                  key={index}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {category}{index < categories.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 