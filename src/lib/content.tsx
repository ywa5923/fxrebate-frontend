import { generateRandomId } from './utils';
import { SlSocialTwitter, SlSocialInstagram, SlSocialFacebook, SlSocialLinkedin } from 'react-icons/sl';
import { FaTelegramPlane } from 'react-icons/fa';

type NavItem = {
    id: number | string;
    name: string;
    href?: string;
    lightIcon?: string;
    darkIcon?: string;
    external?: boolean;
    subItems?: {
        id: number | string;
        name: string;
        sectionHeading?: boolean;
        translationKey?: string;
        href?: string;
        localized?: boolean;
        brokerList?: "broker" | "crypto" | "prop_firm";
        external?: boolean;
        itemsList?: { id: string; brokerName: string; brokerLogo: string; href?: string; external?: boolean }[];
        linksList?: {
            id: string;
            name: string;
            href?: string;
            external?: boolean;
            brokerList?: "broker" | "crypto" | "prop_firm";
            linksList?: { id: string; name: string; href: string; external?: boolean }[];
        }[];
    }[];
};

export const navItems: NavItem[] = [
    {
        id: 1,
        name: 'home',
        href: '/',
        lightIcon: '/assets/icons/homeIcon-light.svg',
        darkIcon: '/assets/icons/homeIcon-dark.svg',
    },
    {
        id: generateRandomId(),
        name: 'brokers',
        subItems: [
            {
                id: 'find-compare',
                name: 'find_compare',
                linksList: [
                    { id: 'all-forex-brokers', name: 'all_forex_brokers', brokerList: 'broker' },
                    { id: 'compare-forex-brokers', name: 'compare_forex_brokers', href: '/forex-brokers/compare' },
                ],
            },
            {
                id: 'rebates-offers',
                name: 'rebates_offers',
                linksList: [
                    {
                        id: 'forex-broker-rebates',
                        name: 'forex_broker_rebates',
                        href: '/forex-brokers/forex-rebates?broker_type=broker',
                    },
                    { id: 'broker-promotions', name: 'broker_promotions', href: '#' },
                    { id: 'broker-contests', name: 'broker_contests', href: '#' },
                ],
            },
            {
                id: 'research-guides',
                name: 'research_guides',
                linksList: [
                    { id: 'forex-broker-guides', name: 'forex_broker_guides', href: '#' },
                    { id: 'best-forex-brokers-2026', name: 'best_forex_brokers_2026', href: '#' },
                ],
            },
        ],
    },
    {
        id: generateRandomId(),
        name: 'crypto',
        subItems: [
            {
                id: 'crypto-find-compare',
                name: 'find_compare',
                linksList: [
                    { id: 'all-crypto-exchanges', name: 'all_crypto_exchanges', brokerList: 'crypto' },
                    { id: 'compare-crypto-exchanges', name: 'compare_crypto_exchanges', href: '/forex-brokers/compare?broker_type=crypto' },
                ],
            },
            {
                id: 'crypto-rebates-offers',
                name: 'rebates_offers',
                linksList: [
                    { id: 'crypto-exchange-rebates', name: 'crypto_exchange_rebates', href: '/forex-brokers/forex-rebates?broker_type=crypto' },
                    { id: 'crypto-promotions', name: 'promotions', href: '#' },
                    { id: 'crypto-contests', name: 'contests', href: '#' },
                ],
            },
            {
                id: 'crypto-research-guides',
                name: 'research_guides',
                linksList: [
                    { id: 'crypto-exchange-guides', name: 'crypto_exchange_guides', href: '#' },
                    { id: 'best-crypto-exchanges-2026', name: 'best_crypto_exchanges_2026', href: '#' },
                ],
            },
        ],
    },
    {
        id: generateRandomId(),
        name: 'props',
        subItems: [
            {
                id: 'prop-firms-find-compare',
                name: 'find_compare',
                linksList: [
                    { id: 'all-prop-firms', name: 'all_prop_firms', brokerList: 'prop_firm' },
                    { id: 'compare-prop-firms', name: 'compare_prop_firms', href: '/forex-brokers/compare?broker_type=prop_firm' },
                ],
            },
            {
                id: 'prop-firms-rebates-offers',
                name: 'rebates_offers',
                linksList: [
                    { id: 'prop-firm-rebates', name: 'prop_firm_rebates', href: '/forex-brokers/forex-rebates?broker_type=prop_firm' },
                    { id: 'prop-firm-promotions', name: 'promotions', href: '#' },
                    { id: 'prop-firm-contests', name: 'contests', href: '#' },
                ],
            },
            {
                id: 'prop-firms-research-guides',
                name: 'research_guides',
                linksList: [
                    { id: 'prop-firm-guides', name: 'prop_firm_guides', href: '#' },
                    { id: 'best-prop-firms-2026', name: 'best_prop_firms_2026', href: '#' },
                ],
            },
        ],
    },
    {
        id: generateRandomId(),
        name: 'tools',
        subItems: [
            {
                id: 'trading-calculators',
                name: 'trading_calculators',
                linksList: [
                    { id: 'currency-converter', name: 'currency_converter', href: '#' },
                    { id: 'pip-calculator', name: 'pip_calculator', href: '#' },
                    { id: 'margin-calculator', name: 'margin_calculator', href: '#' },
                    { id: 'risk-position-calculator', name: 'risk_position_calculator', href: '#' },
                    { id: 'pivot-point-calculator', name: 'pivot_point_calculator', href: '#' },
                    { id: 'fibonacci-calculator', name: 'fibonacci_calculator', href: '#' },
                    { id: 'profit-loss-calculator', name: 'profit_loss_calculator', href: '#' },
                    { id: 'swap-calculator', name: 'swap_calculator', href: '#' },
                ],
            },
            {
                id: 'market-tools',
                name: 'market_tools',
                linksList: [
                    { id: 'economic-calendar', name: 'economic_calendar', href: '#' },
                    { id: 'brokers-spread-comparison', name: 'brokers_spread_comparison', href: '#' },
                    { id: 'forex-market-hours', name: 'forex_market_hours', href: '#' },
                    { id: 'market-correlation', name: 'market_correlation', href: '#' },
                    { id: 'forex-volatility', name: 'forex_volatility', href: '#' },
                    { id: 'interest-rates', name: 'interest_rates', href: '#' },
                ],
            },
            {
                id: 'fxrebate-tools',
                name: 'fxrebate_tools',
                linksList: [
                    { id: 'broker-comparison-tool', name: 'broker_comparison_tool', href: '#' },
                    { id: 'trading-cost-calculator', name: 'trading_cost_calculator', href: '#' },
                    { id: 'rebate-savings-calculator', name: 'rebate_savings_calculator', href: '#' },
                ],
            },
            {
                id: 'featured-tools',
                name: 'featured',
                linksList: [
                    { id: 'forex-rebate-calculator', name: 'forex_rebate_calculator', href: '#' },
                ],
            },
        ],
    },
    { id: generateRandomId(), name: 'charts', href: '#' },
    { id: generateRandomId(), name: 'affiliate_program', href: '/#affiliate' },
    { id: generateRandomId(), name: 'help_center', href: '/help/about' },
    {
        id: generateRandomId(),
        name: 'education',
        subItems: [
            {
                id: generateRandomId(),
                name: 'trading_academy',
                linksList: [
                    { id: generateRandomId(), name: 'learn_forex_trading', href: '#' },
                    { id: generateRandomId(), name: 'learn_crypto_trading', href: '#' },
                    { id: generateRandomId(), name: 'learn_prop_trading', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'understand_the_basics',
                linksList: [
                    { id: generateRandomId(), name: 'what_is_a_forex_broker', href: '#' },
                    { id: generateRandomId(), name: 'what_is_a_crypto_exchange', href: '#' },
                    { id: generateRandomId(), name: 'what_is_a_prop_firm', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'how_to_choose',
                linksList: [
                    { id: generateRandomId(), name: 'a_forex_broker', href: '#' },
                    { id: generateRandomId(), name: 'a_crypto_exchange', href: '#' },
                    { id: generateRandomId(), name: 'a_prop_firm', href: '#' },
                ],
            },
            {
                id: generateRandomId(),
                name: 'reference_resources',
                linksList: [
                    {
                        id: 'financial-regulators',
                        name: 'financial_regulators',
                        href: 'https://fxrebate.eu/help/financial-services-authorities',
                        external: true,
                    },
                    { id: 'trading-glossary', name: 'trading_glossary', href: '#' },
                ],
            },
        ],
    },
    {
        id: 'community',
        name: 'community',
        subItems: [
            {
                id: 'latest-insights',
                name: 'latest_insights',
                linksList: [
                    { id: 'latest-posts', name: 'latest_posts', href: '/blog' },
                    { id: 'market-insights', name: 'market_insights', href: '/blog' },
                    { id: 'trading-strategies', name: 'trading_strategies', href: '/blog' },
                ],
            },
            {
                id: 'fxrebate-updates',
                name: 'fxrebate_updates',
                linksList: [
                    { id: 'fxrebate-news', name: 'fxrebate_news', href: '/blog' },
                    { id: 'newsletter', name: 'newsletter', href: '/#newsletter' },
                ],
            },
        ],
    },
    {
        id: 'connect',
        name: 'connect',
        subItems: [
            {
                id: 'telegram-community',
                name: 'telegram_community',
                href: 'https://t.me/fxrebateme',
                external: true,
            },
        ],
    },
    {
        id: generateRandomId(),
        name: 'support',
        subItems: [
            {
                id: 'help-center',
                name: 'help_center',
                href: '#',
            },
            {
                id: 'support-faqs',
                name: 'faqs',
                linksList: [
                    { id: 'getting-started', name: 'getting_started', href: '#' },
                    { id: 'linking-account', name: 'linking_your_account', href: '#' },
                    { id: 'rebates-eligibility', name: 'rebates_eligibility', href: '#' },
                    { id: 'payments-withdrawals', name: 'payments_withdrawals', href: '#' },
                    { id: 'account-referrals', name: 'account_referrals', href: '#' },
                ],
            },
            { id: 'contact-us', name: 'contact_us', href: '#' },
            { id: 'live-chat', name: 'live_chat', href: '#' },
        ],
    },
    {
        id: generateRandomId(),
        name: 'company',
        subItems: [
            { id: 'company-about-us', name: 'about_us', href: '#' },
            {
                id: 'company-legal-documents',
                name: 'legal_documents',
                linksList: [
                    { id: 'terms-of-service', name: 'terms_of_service', href: '#' },
                    { id: 'affiliate-terms-of-service', name: 'affiliate_terms_of_service', href: '#' },
                    { id: 'privacy-policy', name: 'privacy_policy', href: '#' },
                    { id: 'cookie-policy', name: 'cookie_policy', href: '#' },
                    { id: 'risk-disclosure', name: 'risk_disclosure', href: '#' },
                ],
            },
            {
                id: 'company-business-information',
                name: 'business_information',
                linksList: [
                    { id: 'how-fxrebate-works', name: 'how_fxrebate_works', href: '#' },
                    { id: 'rebate-types', name: 'rebate_types', href: '#' },
                    { id: 'rebate-payments', name: 'rebate_payments', href: '#' },
                    { id: 'custom-rebate-offers', name: 'custom_rebate_offers', href: '#' },
                ],
            },
        ],
    },
];

export const socialItems = [
    {
        id: 1,
        name: 'LinkedIn',
        href: '#',
        icon: <SlSocialLinkedin className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 2,
        name: 'Instagram',
        href: '#',
        icon: <SlSocialInstagram className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 3,
        name: 'Facebook',
        href: '#',
        icon: <SlSocialFacebook className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 4,
        name: 'Twitter',
        href: '#',
        icon: <SlSocialTwitter className="text-xl transition-all duration-200 hover:text-accent" />,
    },
    {
        id: 5,
        name: 'Telegram',
        href: '#',
        icon: <FaTelegramPlane className="text-xl transition-all duration-200 hover:text-accent" />,
    },
];

export const companyStats = {
    title: 'company_stats_title',
    stats: [
        { id: generateRandomId(), num: 8, nextSuffix: 'K+', subheading: 'active_clients' },
        { id: generateRandomId(), num: 20, nextSuffix: '+_years', subheading: 'experience_in_financial_markets' },
        { id: generateRandomId(), num: 5, prevSuffix: '$', nextSuffix: 'million_+', subheading: 'paid_in_rebates' },
        {
            id: generateRandomId(),
            num: 500,
            prevSuffix: '$',
            nextSuffix: 'K+',
            subheading: 'paid_in_affiliate_commissions',
        },
    ],
};

export const ourPartners = {
    title: 'FXRebate_partners',
    items: [
        { id: generateRandomId(), name: 'FBS', href: '#', lightIcon: '/assets/partners/FBS-light.webp' },
        { id: generateRandomId(), name: 'Fortrade', href: '#', lightIcon: '/assets/partners/Fortrade-light.webp' },
        {
            id: generateRandomId(),
            name: 'LandPrime',
            href: '#',
            lightIcon: '/assets/partners/LandPrime-dark.webp',
            darkIcon: '/assets/partners/LandPrime-light.webp',
        },
        {
            id: generateRandomId(),
            name: 'M4Markets',
            href: '#',
            lightIcon: '/assets/partners/M4Markets-dark.webp',
            darkIcon: '/assets/partners/M4Markets-light.webp',
        },
        { id: generateRandomId(), name: 'TickMill', href: '#', lightIcon: '/assets/partners/TickMill-light.webp' },
        { id: generateRandomId(), name: 'TopFX', href: '#', lightIcon: '/assets/partners/TopFX-light.webp' },
    ],
};

export const ourPaymentMethods = {
    title: 'payment_options',
    methods: [
        { id: generateRandomId(), name: 'Skrill', href: '#', lightIcon: '/assets/payments/skrill.webp' },
        {
            id: generateRandomId(),
            name: 'Bank',
            href: '#',
            lightIcon: '/assets/payments/Bank-dark.webp',
            darkIcon: '/assets/payments/Bank-light.webp',
        },
        {
            id: generateRandomId(),
            name: 'Bitcoin',
            href: '#',
            lightIcon: '/assets/payments/dark-bitcoin.webp',
            darkIcon: '/assets/payments/light-bitcoin.webp',
        },
        {
            id: generateRandomId(),
            name: 'Ethereum',
            href: '#',
            lightIcon: '/assets/payments/Ethereum-dark.webp',
            darkIcon: '/assets/payments/Ethereum-light.webp',
        },
        { id: generateRandomId(), name: 'PayPal', href: '#', lightIcon: '/assets/payments/paypal.webp' },
        { id: generateRandomId(), name: 'Tether', href: '#', lightIcon: '/assets/payments/Tether-light.webp' },
    ],
};

export const whyUs = {
    title: 'why_us',
    description:'why_us_header',

    features: [
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-cup.webp',
            lightBgImage: '/assets/whyUs/light-cup.webp',
            title: 'why_us_t',
            description: 'why_us_d',
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-stairs.webp',
            lightBgImage: '/assets/whyUs/light-stairs.webp',
            title: 'why_us_t1',
            description:'why_us_d1',
        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-hand.webp',
            lightBgImage: '/assets/whyUs/light-hand.webp',
            title: 'why_us_t2',
            description: 'why_us_d2',

        },
        {
            id: generateRandomId(),
            darkBgImage: '/assets/whyUs/dark-shield.webp',
            lightBgImage: '/assets/whyUs/light-shield.webp',
            title: 'why_us_t3',
            description: 'why_us_d3',
        },
    ],
};

export const whyJoinUs = [
    {
        id: generateRandomId(),
        title: 'why_join_us_t1',
        description:'why_join_us_d1',
        className: 'dark:text-white dark:bg-black text-black bg-white',
        tagContent:'why_join_us'
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t2',
        description:'why_join_us_d2',
        className: 'dark:text-white dark:bg-dark-green-200 text-black bg-white-200',
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t3',
        description:'why_join_us_d3',
        className: 'dark:bg-white text-black bg-[#FBFBFB]',
        button: {
            text: 'btn_join_the_aff_network',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t4',
        description: 'why_join_us_d4',
        className: 'dark:text-white dark:bg-black text-black bg-white-200',
        button: {
            text: 'btn_view_all_tools',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
    {
        id: generateRandomId(),
        title: 'why_join_us_t5',
        description:'why_join_us_d5',
        className: 'dark:bg-white text-black bg-[#FBFBFB]',
        button: {
            text: 'btn_contact_us',
            iconImage: '/assets/icons/arrow-right.svg',
            href: '#',
        },
    },
];

export const testimonials = {
    title: 'testimonials_title',
    items: [
        {
            id: generateRandomId(),
            name: 'John Doe',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Lorem ipsum dolor sit amet consectetur. Commodo lobortis quam dignissim massa venenatis. Auctor molestie sit orci id ipsum. Pharetra tincidunt imperdiet pellentesque amet. Duis ultrices dui pharetra arcu. Tortor ante vestibulum auctor lacus dictum enim.',
        },
        {
            id: generateRandomId(),
            name: 'Emily Clark',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Sit etiam quam lorem dui tortor facilisis. Amet mi velit dui cursus quis in vitae quisque non.',
        },
        {
            id: generateRandomId(),
            name: 'Alice Smith',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Lorem ipsum dolor sit amet consectetur. Commodo lobortis quam dignissim massa venenatis. Auctor molestie sit orci id ipsum. Pharetra tincidunt imperdiet pellentesque amet. Duis ultrices dui pharetra arcu. Tortor ante vestibulum auctor lacus dictum enim.',
        },
        {
            id: generateRandomId(),
            name: 'Bob Johnson',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Sit etiam quam lorem dui tortor facilisis. Amet mi velit dui cursus quis in vitae quisque non.',
        },
        {
            id: generateRandomId(),
            name: 'Charlie Brown',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Lorem ipsum dolor sit amet consectetur. Commodo lobortis quam dignissim massa venenatis. Auctor molestie sit orci id ipsum. Pharetra tincidunt imperdiet pellentesque amet. Duis ultrices dui pharetra arcu. Tortor ante vestibulum auctor lacus dictum enim.',
        },
        {
            id: generateRandomId(),
            name: 'Diana Prince',
            videoSrc: '/',
            userImage: '/assets/users/user.webp',
            date: '12 Dec, 2024',
            rating: '5.0 Review',
            quote: 'Sit etiam quam lorem dui tortor facilisis. Amet mi velit dui cursus quis in vitae quisque non.',
        },
    ],
};

export const footerContent = {
    disclaimer:
        'It is possible that you can lose all of the money you deposit, and in some circumstance you may even be required to deposit additional sums to cover you loses. By undertaking these types of high risk trades you acknowledge that you are trading with your available risk capital and any losses you may incur will not adversely affect your lifestyle. The high degree of leverage can work against you as well as for you. You must be aware of the risks of investing in forex, futures, and options and be willing to accept them in order to trade in these markets. Forex trading involves substantial risk of loss and is not suitable for all investors. Please do not trade with borrowed money or money you cannot afford to lose. This website is neither a solicitation nor an offer to Buy or Sell currencies, futures, or options. No representation is being made that any account will or is likely to achieve profits or losses similar to those discussed on this website. Any opinions, news, research, analysis, prices, or other information contained on this website is provided as general market commentary and does not constitute investment advice. Website owners and affiliates will not accept liability for any loss or damage, including without limitation to, any loss of profit, which may arise directly or indirectly from the use of or reliance on such information. Please remember that the past performance of any trading system or methodology is not necessarily indicative of future results. Trading foreign exchange, commodity futures, options, precious metals and other over-the-counter or no-exchange products carries a high level of risk and may not be suitable for all investors.',
    navItems: [
        {
            title: 'Main',
            items: [
                { name: 'Forex Brokers', href: '#' },
                { name: 'Crypto Exchanges', href: '#' },
                { name: 'Prop Firms', href: '#' },
                { name: 'Affiliate Program', href: '#' },
            ],
        },
        {
            title: 'Tools & Education',
            items: [
                { name: 'Trading Academy', href: '#' },
                { name: 'Trading Tools', href: '#' },
                { name: 'Charts', href: '#' },
                { name: 'Blog', href: '#' },
                { name: 'Telegram', href: '#' },
            ],
        },
        {
            title: 'Company information',
            items: [
                { name: 'About us', href: '#' },
                { name: 'Contact', href: '#' },
                { name: 'Help Center', href: '#' },
                { name: 'Terms of Service', href: '#' },
                { name: 'Privacy Policy', href: '#' },
            ],
        },
    ],
};
