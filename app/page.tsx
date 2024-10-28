"use client";

import { Suspense } from "react";
import Map from "./Map"; // Adjust the path as necessary

export default function Home() {
  return (
    <div>
      <Suspense fallback={null}>
        <Map />
      </Suspense>
    </div>
  );
}
