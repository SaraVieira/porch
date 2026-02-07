import { BsBookFill, BsReddit, BsServer } from 'react-icons/bs'
import { RiBlueskyFill, RiNetflixFill } from 'react-icons/ri'
import {
  SiAliexpress,
  SiAmazon,
  SiBambulab,
  SiEbay,
  SiGithub,
  SiGmail,
  SiGooglecalendar,
  SiGooglemaps,
  SiNintendogamecube,
  SiPrintables,
  SiSteam,
} from 'react-icons/si'
import { TbBrandDisney, TbBrandYoutubeFilled } from 'react-icons/tb'

export const linkGroups = [
  {
    category: 'General',
    links: [
      {
        title: 'Gmail',
        link: 'https://gmail.com',
        Icon: SiGmail,
      },
      {
        title: 'Github',
        link: 'https://github.com',
        Icon: SiGithub,
      },
      {
        title: 'Calendar',
        link: 'https://calendar.google.com',
        Icon: SiGooglecalendar,
      },
      {
        title: 'Maps',
        link: 'https://maps.google.com',
        Icon: SiGooglemaps,
      },
    ],
    color: 'text-purple-500',
  },
  {
    category: 'Entertainment',
    links: [
      {
        title: 'Youtube',
        link: 'https://youtube.com',
        Icon: TbBrandYoutubeFilled,
      },
      {
        title: 'Disney+',
        link: 'https://disneyplus.com',
        Icon: TbBrandDisney,
      },
      {
        title: 'Netflix',
        link: 'https://netflix.com',
        Icon: RiNetflixFill,
      },
    ],
    color: 'text-yellow-500',
  },

  {
    category: 'Social',
    color: 'text-blue-600',
    links: [
      {
        title: 'BlueSky',
        link: 'https://bsky.app/',
        Icon: RiBlueskyFill,
      },
      {
        title: 'Reddit',
        link: 'https://reddit.com/',
        Icon: BsReddit,
      },
    ],
  },
  {
    category: 'Printing',
    color: 'text-green-600',
    links: [
      {
        title: 'Printables',
        link: 'https://printables.com/',
        Icon: SiPrintables,
      },
      {
        title: 'MakerWorld',
        link: 'https://makerworld.com/',
        Icon: SiBambulab,
      },
    ],
  },
  {
    category: 'Games',
    color: 'text-blue-200',
    links: [
      {
        title: 'Romm',
        link: 'https://roms.iamsaravieira.com/',
        Icon: SiNintendogamecube,
      },
      {
        title: 'Steam',
        link: 'https://steam.com/',
        Icon: SiSteam,
      },
    ],
  },
  {
    category: 'Shopping',
    color: 'text-red-400',
    links: [
      {
        title: 'Amazon',
        link: 'https://amazon.com',
        Icon: SiAmazon,
      },
      {
        title: 'AliExpress',
        link: 'https://ebay.co.uk/',
        Icon: SiAliexpress,
      },
      {
        title: 'Ebay',
        link: 'https://aliexpress.com',
        Icon: SiEbay,
      },
    ],
  },
  {
    category: 'Self Hosting',
    color: 'text-orange-400',
    links: [
      {
        title: 'Dashboard',
        link: 'https://dashboard.iamsaravieira.com',
        Icon: BsServer,
      },
      {
        title: 'The Books',
        link: 'https://books.iamsaravieira.com',
        Icon: BsBookFill,
      },
    ],
  },
]
