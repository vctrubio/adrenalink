import Link from "next/link";

export default function LandingPageHome() {

    return (
        <div className='border w-full flex flex-col items-center justify-center p-8 gap-4'>
            <div>
                <h1>Adrenalink</h1>
                <div className='slogan text-sm w-full mx-auto text-center'>for junkies / connecting students and teachers</div>
            </div>
            <div className='flex gap-2 [&>*]:border px-4 py-2 rounded-md hover:bg-accent/50 transition-colors'>
                <Link href={"schools/form"}>
                    school
                </Link>
                <button>students</button>
            </div>
        </div>
    );
}
