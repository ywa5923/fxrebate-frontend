import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useMounted } from '@/lib/hooks';

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
    children: ReactNode;
    className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
    title: string;
    description: string;
    containerClassName?: string;
    darkBgImage?: string;
    lightBgImage?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
    return (
        <div className={cn('grid w-full md:grid-cols-3 auto-rows-[22rem] gap-4', className)} {...props}>
            {children}
        </div>
    );
};

const BentoCard = ({ title, description, containerClassName, darkBgImage, lightBgImage, ...props }: BentoCardProps) => {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <div
            className={cn(
                'group relative border flex flex-col justify-end rounded-xl p-4 sm:p-6',
                'bg-white-200 border-white-400',
                'transform-gpu dark:bg-dark-green-100 dark:border-dark-brown-100',
                containerClassName
            )}
            {...props}>
            <div className="z-10 transform-gpu transition-all duration-300 group-hover:-translate-y-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[28px] md:text-[38px] leading-[111%] font-bold text-black dark:text-white">
                        {title}
                    </h3>
                    <p className="max-w-[560px] text-xl text-black dark:text-white mt-2 xxs:mt-4">{description}</p>
                </div>
            </div>
            <div className="absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
            <img
                src={resolvedTheme === 'light' ? lightBgImage : darkBgImage}
                alt={title}
                className="absolute right-0  bottom-0 h-full w-[99%] md:w-full max-w-none object-contain sm:object-cover"
            />
        </div>
    );
};

export { BentoCard, BentoGrid };
