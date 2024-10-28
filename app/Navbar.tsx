import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <nav className=" flex gap-4 sticky top-0 left-0 z-10 bg-white w-full">
        <Button variant="link">
          <Link href="/">Home</Link>
        </Button>
        <Button variant="link">
          <Link href="/spot-marker">Mark Parking Lot</Link>
        </Button>
      </nav>
      <main className="relative">{children}</main>
    </div>
  );
}

export default Navbar;
