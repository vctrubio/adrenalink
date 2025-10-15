"use client";

import { useState } from "react";

type Sport = {
  id: number;
  name: string;
  label: string;
  color: string;
};

const sports: Sport[] = [
    { id: 1, name: "kite", label: "Kitesurfing", color: "bg-blue-500 hover:bg-blue-600" },
    { id: 2, name: "wing", label: "Wing Foiling", color: "bg-green-500 hover:bg-green-600" },
    { id: 3, name: "windsurf", label: "Windsurfing", color: "bg-purple-500 hover:bg-purple-600" },
    { id: 4, name: "paragliding", label: "Paragliding", color: "bg-orange-500 hover:bg-orange-600" },
    { id: 5, name: "surf", label: "Surfing", color: "bg-red-500 hover:bg-red-600" },
    { id: 6, name: "snow", label: "Snow Sports", color: "bg-gray-500 hover:bg-gray-600" },
];

interface SportTagProps {
  sport: Sport;
  isSelected: boolean;
  onClick: (sport: Sport) => void;
}

function SportTag({ sport, isSelected, onClick }: SportTagProps) {
    return (
        <button
            onClick={() => onClick(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                isSelected
                    ? `${sport.color} text-white`
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
        >
            {sport.label}
        </button>
    );
}

export default function Banner() {
    const [selectedSport, setSelectedSport] = useState(sports[0]);

    return (
        <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold tracking-tight transition-all duration-300 hover:scale-105">
        Adrenalink
            </h1>

            <div className="space-y-4">
                <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors slogan">
          student - teacher connection
                </p>
                <p className="text-lg font-medium">pick your sport</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {sports.map((sport) => (
                    <SportTag
                        key={sport.id}
                        sport={sport}
                        isSelected={selectedSport.id === sport.id}
                        onClick={setSelectedSport}
                    />
                ))}
            </div>

            <div className="mt-6">
                <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selectedSport.label}</span>
                </p>
            </div>
        </div>
    );
}
