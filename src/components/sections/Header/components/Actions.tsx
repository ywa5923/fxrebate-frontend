'use client';

import { Translations, useTranslation } from '@/providers/translations';
import Link from 'next/link';

export const Actions = () => {

    const _t:Translations=useTranslation();
    return (
        <div className="max-w-[380px] w-full mx-auto lg:w-auto lg:max-w-auto flex flex-col lg:flex-row items-center gap-3 mt-12 px-6 lg:px-0 lg:mt-0">
            <Link
                href="#"
                className="w-full lg:w-auto bg-transparent border border-black/25 dark:border-white/25 text-black dark:text-white text-center font-medium px-[24px] py-[6px] rounded-sm transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10">
                {_t['login']}
            </Link>
            <Link
                href="#"
                className="w-full lg:w-auto bg-black dark:bg-white text-white dark:text-black text-center font-medium px-[24px] py-[6px] rounded-sm shadow-[0px_3px_8.1px_0px_rgba(0,0,0,0.22)] transition-all duration-300 hover:bg-black/80 dark:hover:bg-white/80">
                  {_t['join_now']}
            </Link>
        </div>
    );
};
