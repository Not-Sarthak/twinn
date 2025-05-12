import Link from "next/link";
import { SocialPill } from "./social-pill";
import { GridWrapper } from "../ui/grid-wrapper";
import Image from "next/image";

interface FooterLink {
  href: string;
  label: string;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "General",
    links: [
      { href: "/", label: "Home" },
      { href: "/gallery", label: "Gallery" },
      { href: "/collections", label: "Collections" },
      { href: "/buy-credits", label: "Buy Credits" },
    ],
  },
  {
    title: "Extra",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      // Below htis
    ],
  },
];

export function Footer(): JSX.Element {
  const renderFooterLink = (link: FooterLink): JSX.Element => {
    if (link.isExternal) {
      return (
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      );
    }
    return <Link href={link.href}>{link.label}</Link>;
  };

  return (
    <>
      <div className="relative max-w-7xl border-t border-border-primary/10">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            className="h-full w-full object-cover opacity-70"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/landing/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <GridWrapper>
          <div className="relative z-10 max-w-6xl px-4 lg:mx-auto lg:flex lg:divide-x lg:divide-border-primary/20 lg:px-4 xl:px-0">
            <div className="flex w-3/4 py-6 text-sm">
              <div className="w-full">
                <div className="flex-grow space-y-6">
                  <Link className="inline-block" href="/">
                    <Image
                      className="h-10 w-10"
                      src="/logo.svg"
                      alt="Logo"
                      width={40}
                      height={40}
                    />
                  </Link>
                  <p className="font-garamond text-4xl italic text-black">
                    Give it a try - <br /> it costs nothing
                  </p>
                </div>
                <p className="mt-6 text-gray-500">
                  © {new Date().getFullYear()} Twinn
                </p>
              </div>
            </div>
            <div className="flex w-1/4 flex-col py-6 text-xs lg:pl-8">
              <div className="flex w-full flex-col space-y-8 md:flex-row md:space-x-8 md:space-y-0">
                {footerSections.map((section) => (
                  <div key={section.title}>
                    <span className="mb-4 inline-block text-base font-medium text-text-primary">
                      {section.title}
                    </span>
                    <ul className="space-y-2 text-sm text-gray-500">
                      {section.links.map((link) => (
                        <li className="hover:text-text-primary" key={link.href}>
                          {renderFooterLink(link)}
                        </li>
                      ))}
                    </ul>
                    {section.title === "Extra" && (
                      <div className="mt-6">
                        <SocialPill />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GridWrapper>
      </div>
      <div className="relative h-8 w-full [background-image:linear-gradient(45deg,theme(colors.border-primary)_12.50%,transparent_12.50%,transparent_50%,theme(colors.border-primary)_50%,theme(colors.border-primary)_62.50%,transparent_62.50%,transparent_100%)] [background-size:5px_5px]"></div>
    </>
  );
}
