import {
  BookOpenText as BookIcon,
  Ear as EarIcon,
  Microphone as MicrophoneIcon,
  SmileySticker as SmileyIcon,
} from "@phosphor-icons/react";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10 sm:px-10 md:px-14">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-semibold text-neutral-800">StyleSync</h1>
          <p className="mt-4 text-lg text-neutral-600">
            Discover outfit picks that match your emotions and preferences. Use our Tinder-based recommendation system to find what you love and contribute to a sustainable future by donating your clothes at optimal prices based on market demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ModelSection name="Explore" page="/explore" iconClass={SmileyIcon} description="Find outfits that match your style and mood." />
          <ModelSection name="Donate" page="/donate" iconClass={EarIcon} description="Donate your clothes to Goodwills at the best prices." />
          {/* <ModelSection name="Vocal Burst" page="/burst" iconClass={MicrophoneIcon} />
          <ModelSection name="Written Language" page="/language" iconClass={BookIcon} /> */}
        </div>
      </div>
    </div>
  );
}

type ModelSectionProps = {
  iconClass: any;
  name: string;
  page: string;
  description: string;
};

function ModelSection(props: ModelSectionProps) {
  return (
    <Link href={props.page}>
      <div className="group block rounded-lg border border-neutral-200 bg-white p-6 shadow hover:shadow-lg transition-shadow duration-300 ease-in-out">
        <div className="flex items-center justify-center h-24">
          <props.iconClass size={40} className="text-neutral-700 group-hover:text-blue-500 transition-colors duration-300 ease-in-out" />
        </div>
        <div className="mt-4 text-center text-xl font-medium text-neutral-800 group-hover:text-blue-500 transition-colors duration-300 ease-in-out">
          {props.name}
        </div>
        <p className="mt-2 text-center text-neutral-600">{props.description}</p>
      </div>
    </Link>
  );
}
