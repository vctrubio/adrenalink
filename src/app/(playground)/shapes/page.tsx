import OctagonShape from "@/public/shapes/OctagonShape";
import ASingleShape from "@/public/shapes/ASingleShape";
import ADoubleShape from "@/public/shapes/ADoubleShape";
import AVerticalShape from "@/public/shapes/AVerticalShape";
import AHorizontalShape from "@/public/shapes/AHorizontalShape";

const SHAPES = [
  { title: "Octagon", component: OctagonShape },
  { title: "A Single", component: ASingleShape },
  { title: "A Double", component: ADoubleShape },
  { title: "A Vertical", component: AVerticalShape },
  { title: "A Horizontal", component: AHorizontalShape }
];

export default function ShapesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-12">Shapes</h1>
      {SHAPES.map((shape, index) => (
        <div key={shape.title}>
          <ShapeSection title={shape.title} component={shape.component} />
          {index < SHAPES.length - 1 && <ShapeSeparator />}
        </div>
      ))}
    </div>
  );
}

function ShapeSection({ title, component: Component }: { title: string; component: any }) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-semibold text-center mb-8">{title}</h2>
      <Component />
    </div>
  );
}

function ShapeSeparator() {
  return <div className="w-full h-px bg-border my-12" />;
}
