"use client";

import React from "react";
import EcosystemBeamSection from "./EcosystemBeamSection";
import { Coffee, UserRound, School, FlaskConical, Users } from "lucide-react";

/**
 * Example usage of EcosystemBeamSection with sample data
 * This demonstrates the circular economy visualization for Sikupi
 */
export default function EcosystemBeamDemo() {
  // Sample data for the ecosystem
  const ecosystemData = {
    supplier: {
      icon: {
        type: "react" as const,
        element: <Coffee className="text-amber-700" />
      },
      label: "Warung Kopi"
    },
    center: {
      icon: {
        type: "img" as const,
        src: "/sikupo-vertical-no-bg.png",
        alt: "Sikupi Logo"
      },
      label: "Sikupi Hub"
    },
    markets: [
      {
        id: "individuals",
        icon: {
          type: "react" as const,
          element: <UserRound className="text-amber-600" />
        },
        label: "Individu"
      },
      {
        id: "schools",
        icon: {
          type: "react" as const,
          element: <School className="text-amber-800" />
        },
        label: "Sekolah"
      },
      {
        id: "researchers",
        icon: {
          type: "react" as const,
          element: <FlaskConical className="text-orange-700" />
        },
        label: "Peneliti"
      },
      {
        id: "communities",
        icon: {
          type: "react" as const,
          element: <Users className="text-yellow-700" />
        },
        label: "Komunitas"
      }
    ]
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white">
      <EcosystemBeamSection
        supplier={ecosystemData.supplier}
        center={ecosystemData.center}
        markets={ecosystemData.markets}
        beamDurationSec={3}
        className="border-t border-gray-100"
      />
    </div>
  );
}
