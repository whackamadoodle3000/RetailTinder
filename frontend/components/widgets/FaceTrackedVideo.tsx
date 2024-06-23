import { useEffect, useRef, useState } from "react";
import TinderCard from "react-tinder-card";
import { TrackedFace } from "../../lib/data/trackedFace";

interface Photo {
  next_image: string;
  clothes_id: number;
  price: number;
  link_to_shop: string;
}

type FaceTrackedVideoProps = {
  className?: string;
  photos: Photo[]; // Array of photo objects
  trackedFaces: TrackedFace[];
  onVideoReady: (video: HTMLVideoElement) => void;
  width: number;
  height: number;
  callbackNewPhotos: (date: Date, direction: string, currID: number) => void;
};

export function FaceTrackedVideo({ className, trackedFaces, onVideoReady, photos, width, height, callbackNewPhotos }: FaceTrackedVideoProps) {
  const [currentIndex, setCurrentIndex] = useState(photos.length - 1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const swiped = (direction: string, index: number, clothes_id: number) => {
    setCurrentIndex(index - 1);
    const now = new Date();
    callbackNewPhotos(now, direction, clothes_id);
  };

  const outOfFrame = (name: string) => {
    console.log(name + " left the screen!");
  };

  className = className || "";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      console.error("Missing video element");
      return;
    }
    onVideoReady(videoElement);
  }, [onVideoReady]);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const videoElement = videoRef.current;
    const graphics = canvasElement?.getContext("2d");

    if (canvasElement && videoElement && graphics) {
      canvasElement.width = videoElement.width = 500;
      canvasElement.height = videoElement.height = 350;
      graphics.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (trackedFaces.length > 0) {
        graphics.fillStyle = "rgb(40, 40, 40, 0.5)";
        graphics.fillRect(0, 0, canvasElement.width, canvasElement.height);
      }

      trackedFaces.forEach((trackedFace: TrackedFace) => {
        const bbox = trackedFace.boundingBox;
        const scale = 20;
        const b = { x: bbox.x - scale, y: bbox.y - scale, w: bbox.w + 2 * scale, h: bbox.h + 2 * scale };

        graphics.beginPath();

        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const rx = b.w / 2;
        const ry = b.h / 2;

        graphics.lineWidth = 5;
        graphics.strokeStyle = "rgb(250, 250, 250, 0.1)";
        graphics.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI * 2);
        graphics.stroke();

        graphics.globalCompositeOperation = "destination-out";
        graphics.fillStyle = "rgb(0, 0, 0, 1)";
        graphics.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI * 2);
        graphics.fill();
        graphics.globalCompositeOperation = "source-over";
      });
    }
  }, [trackedFaces]);

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <div style={{display: "flex", flexDirection: "column"}} className={`relative h-[200px] w-400px overflow-hidden rounded-lg border border-neutral-300 bg-transparent align-top shadow md:h-[500px] md:w-[500px] ${className}`}>
        {photos.map((photo, index) => (
          <TinderCard
  className="absolute w-full h-full"
  key={photo.next_image}
  onSwipe={(dir) => swiped(dir, index, photo.clothes_id)}
  onCardLeftScreen={() => outOfFrame(photo.clothes_id.toString())}
  preventSwipe={["up", "down"]}
>
  <a
    
    style={{
      display: "block",
      width: "100%",
      height: "100%",
      position: "relative"
    }}
  >    
  {/* <script>
        function openUrl() {
        window.location.href = 'https://www.example.com';
      }
    </script>  */}
    <a href={photo.link_to_shop} style={{marginBottom: "5px"}}>${photo.price}</a>
    <img
      src={photo.next_image}
      alt={`Photo ${index}`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "10px",
        zIndex: index // Ensure the top card is on top
      }}
    />
  </a>
</TinderCard>
        ))}
      </div>
      <div className={`relative h-[200px] w-full overflow-hidden rounded-lg border border-neutral-300 bg-black align-top shadow md:h-[355px] md:w-[500px] ${className} display-hidden`}>
        <video className="absolute -scale-x-[1]" ref={videoRef} autoPlay playsInline></video>
        {/* <canvas className="absolute" ref={canvasRef}></canvas> */}
      </div>
    </div>
  );
}
