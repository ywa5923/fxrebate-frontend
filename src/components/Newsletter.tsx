'use client';

import { motion } from 'framer-motion';
import { opacityAnimation } from '@/lib/motions';

import InViewContainer from './InViewContainer';
import { Translations, useTranslation } from '@/providers/translations';

const Newsletter = () => {
    const _t:Translations=useTranslation();
    return (
        <InViewContainer amount={0.2} className="md-custom-container">
            <motion.div
                variants={opacityAnimation({ delay: 0.5, duration: 1.25 })}
                className="md:rounded-xl bg-custom-blue py-[100px] px-6 sm:px-12 lg:px-20 lg:pt-36 lg:pb-28 flex flex-col md:flex-row items-center justify-center gap-16 lg:gap-24">
                <div className="w-full md:w-[55%] ">
                    <h2 className="section-title md:!text-left !text-white">{_t['newsletter']}</h2>
                    <p className="!font-roboto text-center text-white md:text-left mt-6 text-lg leading-7">
                    {_t['newsletter_content']}
                    </p>
                </div>
                <div className="w-full md:w-[45%]">
                    <form className="flex flex-col gap-4 text-white text-sm font-medium placeholder:text-white">
                        <div className="flex flex-col gap-2">
                            <label className="!font-inter block mt-1.5">{_t['name']}</label>
                            <input
                                placeholder={_t['enter_name']}
                                className="!font-inter pl-3 py-4 border border-white rounded-md w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="!font-inter block mt-1.5">Email</label>
                            <input
                                placeholder={_t['enter_email']}
                                className="!font-inter pl-3 py-4 border border-white rounded-md w-full"
                            />
                        </div>

                        <button className="!font-roboto cursor-pointer w-full bg-white text-black hover:bg-white/80 transition-all duration-300 text-lg rounded-lg mt-4 py-3">
                            {_t['sign_up_now']}
                        </button>

                        <p className="!font-roboto text-md text-white leading-[18px]">
                            {_t['terms_and_conditions']}
                        </p>
                    </form>
                </div>
            </motion.div>
        </InViewContainer>
    );
};

export default Newsletter;
