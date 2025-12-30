"use client";

import SocialShareLinks from "@/components/common/SocialShareLinks";

interface FooterProps {
  textColor?: string;
  iconColor?: string;
}

export default function Footer({ textColor = "#6b7280", iconColor = "#bf8104" }: FooterProps) {
  return (
    <div className="py-3 flex flex-col items-center space-y-2" style={{ color: textColor }}>
      <p className="text-xs">Made with ♥ by Together, Not For</p>
      <div className="flex items-center gap-2">
        <span className="text-sm">follow us on socials</span>
        <SocialShareLinks iconColor={iconColor} />
      </div>
      <div className="font-sans text-xs opacity-30 md:text-sm">
        together, not for © 2025
      </div>
    </div>
  );
}

