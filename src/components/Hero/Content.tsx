import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useMounted } from '@/lib/hooks';
import { fadeIn, opacityAnimation } from '@/lib/motions';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/MButton';
import { VideoDialog } from '../ui/VideoDialog';
import InViewContainer from '../InViewContainer';
import { Translations, useTranslation } from '@/providers/translations';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
const lottieDarkAnimation = { ...(await import('../../../public/assets/lottie/FX-Hero-dark-graphic.json')) };
const lottieLightAnimation = { ...(await import('../../../public/assets/lottie/FX-Hero-light-graphic.json')) };

const HERO_TAGS = [
    {
        icon: '/assets/icons/dolar.svg',
        text: 'where_every_trade_matters',
        alt: 'dolar',
    },
    {
        icon: '/assets/icons/FPA.png',
        starIcon: '/assets/icons/stars.png',
        alt: 'FPA',
    },
    {
        icon: '/assets/icons/trustpilot.png',
        starIcon: '/assets/icons/stars.png',
        alt: 'TrustPilot',
    },
];

export const Content = () => {
    const { resolvedTheme } = useTheme();
    const mounted = useMounted();
    const _t: Translations = useTranslation();

    if (!mounted) return null;

    return (
        <InViewContainer
            amount={0.1}
            className="custom-container flex flex-col items-center justify-center relative z-20 pb-16 sm:pb-24 pt-12 lg:py-16 my-8 xxs:my-12">
            <div className="w-full relative pb-12 sm:pb-24">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-8">
                    <motion.div
                        variants={fadeIn({ direction: 'up', duration: 1.25, value: 25, ease: 'easeInOut' })}
                        className="relative flex flex-col items-center justify-center xxs:flex-row gap-2 xxs:h-8">
                        {HERO_TAGS.map((tag, index) => (
                            <Tag key={index} containerClassName="gap-1 h-full pl-2 pr-3">
                                <>
                                    <Image
                                        src={tag.icon}
                                        alt={tag.alt}
                                        className="w-5 h-5 object-cover"
                                        width={20}
                                        height={20}
                                    />
                                    <span className="text-xs font-medium text-white">
                                        {tag.text ? _t[tag.text] as string : ""}
                                    </span>
                                    {tag.starIcon && (
                                        <Image
                                            src={tag.starIcon}
                                            alt={tag.alt}
                                            className="w-18 h-auto object-cover"
                                            width={72}
                                            height={15}
                                        />
                                    )}
                                </>
                            </Tag>
                        ))}
                    </motion.div>
                    <motion.h1
                        variants={fadeIn({
                            direction: 'up',
                            delay: 0.25,
                            duration: 1.25,
                            value: 25,
                            ease: 'easeInOut',
                        })}
                        className="section-title leading-[111%]">
                        {_t["hero_header"] as string}
                    </motion.h1>
                    <motion.p
                        variants={fadeIn({ direction: 'up', delay: 0.5, duration: 1.25, value: 25, ease: 'easeInOut' })}
                        className="section-description max-w-2xl dark:text-white text-black sm:my-3.5">
                        {_t["hero_content"] as string}
                    </motion.p>
                    <motion.div
                        variants={fadeIn({
                            direction: 'up',
                            delay: 0.75,
                            duration: 1.25,
                            value: 25,
                            ease: 'easeInOut',
                        })}
                        className="relative w-full flex flex-col items-center justify-center gap-2 xxs:flex-row">
                        <Link
                            href="#"
                            className="text-center text-sm sm:text-base text-nowrap max-w-3xs w-full xxs:min-w-auto xxs:w-auto bg-black dark:bg-white text-white dark:text-black font-medium px-[22px] py-[13px] sm:py-[11px] rounded-lg shadow-[0px_3px_8.1px_0px_rgba(0,0,0,0.22)] transition-all duration-300 hover:bg-black/80 dark:hover:bg-white/80">
                            {_t["join_now"] as string}
                        </Link>
                        <Button
                            buttonContainerClassName="py-1.5 w-full xxs:w-auto !max-w-3xs"
                            buttonClassName="py-1.5 !max-w-3xs min-w-auto xxs:min-w-3xs"
                            text={_t["hero_btn_text"] as string}
                            iconImage="/assets/icons/play.svg"
                            href="#"
                        />

                        <div className="lottie-animation absolute block xs:hidden -top-[70px] left-1/2 -translate-x-1/2 -translate-y-1/2 -z-50 w-full h-auto">
                            {mounted && (
                                <Lottie
                                    className="h-full w-full"
                                    animationData={
                                        resolvedTheme === 'dark' ? lottieDarkAnimation : lottieLightAnimation
                                    }
                                    loop={false}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
                <div className="lottie-animation absolute -bottom-2 xxs:-bottom-5 hidden xs:block lg:-bottom-7 xl:-bottom-12 left-0 -z-50 w-full h-auto">
                    {mounted && (
                        <Lottie
                            className="h-full w-full"
                            animationData={resolvedTheme === 'dark' ? lottieDarkAnimation : lottieLightAnimation}
                            loop={false}
                        />
                    )}
                </div>
            </div>

            <motion.div
                variants={opacityAnimation({ delay: 0.75, duration: 1.25 })}
                className="relative z-50  bg-white/50 dark:bg-black/50 rounded-[10px] h-auto w-full p-2">
                <VideoDialog
                    animationStyle="top-in-bottom-out"
                    videoSrc="/"
                    thumbnailSrc="/assets/hero/dashboard.webp"
                    thumbnailAlt="FXRebate Dashboard"
                    containerClassName="bg-white/50 dark:bg-black/50 rounded-md h-auto w-full"
                    imageClassName="rounded-md border border-dark-green-200"
                />
            </motion.div>
        </InViewContainer>
    );
};
