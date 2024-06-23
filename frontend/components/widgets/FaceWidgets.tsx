// import { Emotion, EmotionName } from "../../lib/data/emotion";
// import { None, Optional } from "../../lib/utilities/typeUtilities";
// import { useContext, useEffect, useRef, useState } from "react";

// import { AuthContext } from "../menu/Auth";
// import { Descriptor } from "./Descriptor";
// import { FacePrediction } from "../../lib/data/facePrediction";
// import { FaceTrackedVideo } from "./FaceTrackedVideo";
// import { LoaderSet } from "./LoaderSet";
// import { TopEmotions } from "./TopEmotions";
// import { TrackedFace } from "../../lib/data/trackedFace";
// import { VideoRecorder } from "../../lib/media/videoRecorder";
// import { blobToBase64 } from "../../lib/utilities/blobUtilities";
// import { getApiUrlWs } from "../../lib/utilities/environmentUtilities";

// type FaceWidgetsProps = {
//   onCalibrate: Optional<(emotions: Emotion[]) => void>;
// };

// export function FaceWidgets({ onCalibrate }: FaceWidgetsProps) {
//   const authContext = useContext(AuthContext);
//   const socketRef = useRef<WebSocket | null>(null);
//   const recorderRef = useRef<VideoRecorder | null>(null);
//   const photoRef = useRef<HTMLCanvasElement | null>(null);
//   const mountRef = useRef(true);
//   const recorderCreated = useRef(false);
//   const numReconnects = useRef(0);
//   const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
//   const [emotions, setEmotions] = useState<Emotion[]>([]);
//   const [status, setStatus] = useState("");
    // const [link, setLink] = useState("");
//   const numLoaderLevels = 5;
//   const maxReconnects = 3;
//   const loaderNames: EmotionName[] = [
//     "Calmness",
//     "Joy",
//     "Amusement",
//     "Anger",
//     "Confusion",
//     "Disgust",
//     "Sadness",
//     "Horror",
//     "Surprise (negative)",
//   ];

//   useEffect(() => {
//     console.log("Mounting component");
//     mountRef.current = true;
//     console.log("Connecting to server");
//     connect();

//     return () => {
//       console.log("Tearing down component");
//       stopEverything();
//     };
//   }, []);

//   function connect() {
//     const socket = socketRef.current;
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       console.log("Socket already exists, will not create");
//     } else {
//       const baseUrl = getApiUrlWs(authContext.environment);
//       const endpointUrl = `${baseUrl}/v0/stream/models`;
//       const socketUrl = `${endpointUrl}?apikey=${authContext.key}`;
//       console.log(`Connecting to websocket... (using ${endpointUrl})`);
//       setStatus(`Connecting to server...`);

//       const socket = new WebSocket(socketUrl);

//       socket.onopen = socketOnOpen;
//       socket.onmessage = socketOnMessage;
//       socket.onclose = socketOnClose;
//       socket.onerror = socketOnError;

//       socketRef.current = socket;
//     }
//   }

//   async function socketOnOpen() {
//     console.log("Connected to websocket");
//     setStatus("Connecting to webcam...");
//     if (recorderRef.current) {
//       console.log("Video recorder found, will use open socket");
//       await capturePhoto();
//     } else {
//       console.warn("No video recorder exists yet to use with the open socket");
//     }
//   }

//   async function socketOnMessage(event: MessageEvent) {
//     setStatus("");
//     const response = JSON.parse(event.data);
//     console.log("Got response", response);
//     const predictions: FacePrediction[] = response.face?.predictions || [];
//     const warning = response.face?.warning || "";
//     const error = response.error;
//     if (error) {
//       setStatus(error);
//       console.error(error);
//       stopEverything();
//       return;
//     }

//     if (predictions.length === 0) {
//       setStatus(warning.replace(".", ""));
//       setEmotions([]);
//     }

//     const newTrackedFaces: TrackedFace[] = [];
//     predictions.forEach(async (pred: FacePrediction, dataIndex: number) => {
//       newTrackedFaces.push({ boundingBox: pred.bbox });
//       if (dataIndex === 0) {
//         const newEmotions = pred.emotions;
//         setEmotions(newEmotions);
//         if (onCalibrate) {
//           onCalibrate(newEmotions);
//         }
//       }
//     });
//     setTrackedFaces(newTrackedFaces);

//     await capturePhoto();
//   }

//   async function socketOnClose(event: CloseEvent) {
//     console.log("Socket closed");

//     if (mountRef.current === true) {
//       setStatus("Reconnecting");
//       console.log("Component still mounted, will reconnect...");
//       connect();
//     } else {
//       console.log("Component unmounted, will not reconnect...");
//     }
//   }

//   async function socketOnError(event: Event) {
//     console.error("Socket failed to connect: ", event);
//     if (numReconnects.current >= maxReconnects) {
//       setStatus(`Failed to connect to the Hume API (${authContext.environment}).
//       Please log out and verify that your API key is correct.`);
//       stopEverything();
//     } else {
//       numReconnects.current++;
//       console.warn(`Connection attempt ${numReconnects.current}`);
//     }
//   }

//   function stopEverything() {
//     console.log("Stopping everything...");
//     mountRef.current = false;
//     const socket = socketRef.current;
//     if (socket) {
//       console.log("Closing socket");
//       socket.close();
//       socketRef.current = null;
//     } else {
//       console.warn("Could not close socket, not initialized yet");
//     }
//     const recorder = recorderRef.current;
//     if (recorder) {
//       console.log("Stopping recorder");
//       recorder.stopRecording();
//       recorderRef.current = null;
//     } else {
//       console.warn("Could not stop recorder, not initialized yet");
//     }
//   }

//   async function onVideoReady(videoElement: HTMLVideoElement) {
//     console.log("Video element is ready");

//     if (!photoRef.current) {
//       console.error("No photo element found");
//       return;
//     }

//     if (!recorderRef.current && recorderCreated.current === false) {
//       console.log("No recorder yet, creating one now");
//       recorderCreated.current = true;
//       const recorder = await VideoRecorder.create(videoElement, photoRef.current);

//       recorderRef.current = recorder;
//       const socket = socketRef.current;
//       if (socket && socket.readyState === WebSocket.OPEN) {
//         console.log("Socket open, will use the new recorder");
//         await capturePhoto();
//       } else {
//         console.warn("No socket available for sending photos");
//       }
//     }
//   }

//   async function capturePhoto() {
//     const recorder = recorderRef.current;

//     if (!recorder) {
//       console.error("No recorder found");
//       return;
//     }

//     const photoBlob = await recorder.takePhoto();
//     sendRequest(photoBlob);
//   }

//   async function sendRequest(photoBlob: Blob) {
//     const socket = socketRef.current;

//     if (!socket) {
//       console.error("No socket found");
//       return;
//     }

//     const encodedBlob = await blobToBase64(photoBlob);
//     const requestData = JSON.stringify({
//       data: encodedBlob,
//       models: {
//         face: {},
//       },
//     });

//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(requestData);
//     } else {
//       console.error("Socket connection not open. Will not capture a photo");
//       socket.close();
//     }
//   }
//   const photos = ["/first.png","/second.png"]
//   // const photos = ["https://www.google.com/imgres?q=random&imgurl=https%3A%2F%2Fmiro.medium.com%2Fv2%2Fda%3Atrue%2Fresize%3Afit%3A1160%2F1*t_G1kZwKv0p2arQCgYG7IQ.gif&imgrefurl=https%3A%2F%2Fmedium.com%2Fcode-yoga%2Frandom-numbers-are-not-random-701dd2fbc2b8&docid=xE8dKOQezaTx3M&tbnid=ulEPx1W8Un2zVM&vet=12ahUKEwjUyaHB5vCGAxWIEkQIHdBaBb8QM3oECCwQAA..i&w=1160&h=720&hcb=2&ved=2ahUKEwjUyaHB5vCGAxWIEkQIHdBaBb8QM3oECCwQAA", "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.lozano-hemmer.com%2Fmethod_random.php&psig=AOvVaw3ah2DAVJpZyLQAUFVpM2y0&ust=1719200348542000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNjghsLm8IYDFQAAAAAdAAAAABAP"];
//   return (
//     <div>
//       <div className="md:flex">
//         <FaceTrackedVideo
//           className="mb-6"
//           photos={photos}
//         />
//         {!onCalibrate && (
//           <div className="ml-10">
//             <TopEmotions emotions={emotions} />
//             <LoaderSet
//               className="mt-8 ml-5"
//               emotionNames={loaderNames}
//               emotions={emotions}
//               numLevels={numLoaderLevels}
//             />
//             <Descriptor className="mt-8" emotions={emotions} />
//           </div>
//         )}
//       </div>

//       <div className="pt-6">{status}</div>
//       <canvas className="hidden" ref={photoRef}></canvas>
//     </div>
//   );
// }

// FaceWidgets.defaultProps = {
//   onCalibrate: None,
// };

import { Emotion, EmotionName } from "../../lib/data/emotion";
import { None, Optional } from "../../lib/utilities/typeUtilities";
import { useContext, useEffect, useRef, useState } from "react";

import { AuthContext } from "../menu/Auth";
import { Descriptor } from "./Descriptor";
import { FacePrediction } from "../../lib/data/facePrediction";
import { FaceTrackedVideo } from "./FaceTrackedVideo";
import { LoaderSet } from "./LoaderSet";
import { TopEmotions } from "./TopEmotions";
import { TrackedFace } from "../../lib/data/trackedFace";
import { VideoRecorder } from "../../lib/media/videoRecorder";
import { blobToBase64 } from "../../lib/utilities/blobUtilities";
import { getApiUrlWs } from "../../lib/utilities/environmentUtilities";

type FaceWidgetsProps = {
  onCalibrate: Optional<(emotions: Emotion[]) => void>;
};

interface Photo {
  next_image: string;
  clothes_id: number;
  link_to_shop: string;
  price: number;
}

export function FaceWidgets({ onCalibrate }: FaceWidgetsProps) {
  const authContext = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<VideoRecorder | null>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const mountRef = useRef(true);
  const recorderCreated = useRef(false);
  const numReconnects = useRef(0);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [status, setStatus] = useState("")
  const [listFrames, setListFrames] = useState<Record<string, any>[]>([]);
  const [lastDate, setLastDate] = useState(0);
  const [currentDate, setCurrentDate] = useState(0);
  const [collect, setCollect] = useState(true);
  const [dataResp, setDataResp] = useState({});
  const [respNum, setRespNum] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [clothesID, setClothesID] = useState(0);
  const [loaded, setLoaded] = useState(false);
    // const [link, setLink] = useState("");
  const [currDirection, setDirection] = useState("left");
  const numLoaderLevels = 5;
  const maxReconnects = 3;
  const loaderNames: EmotionName[] = [
    "Calmness",
    "Joy",
    "Amusement",
    "Anger",
    "Confusion",
    "Disgust",
    "Sadness",
    "Horror",
    "Surprise (negative)",
  ];

  useEffect(() => {
    console.log("Mounting component");
    mountRef.current = true;
    console.log("Connecting to server");
    connect();

    setStatus("");
    setCollect(!collect);
    setLastDate(currentDate);
    // setCurrentDate(listFrames.length);
    // setStatus("Ran");
    console.log("RespNUM:", respNum)
    if(respNum == 0){
      getPhotoData(listFrames, true).then(output => {
        // currOutput = JSON.parse(output);
        console.log(output);
        if (output.length > 0) {
          setLoaded(true);
        }
      })
    } else {
      getPhotoData(listFrames);
    }

    // return () => {
    //   console.log("Tearing down component");
    //   stopEverything();
    // };
  }, [status]);

  function connect() {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Socket already exists, will not create");
    } else {
      const baseUrl = getApiUrlWs(authContext.environment);
      const endpointUrl = `${baseUrl}/v0/stream/models`;
      const socketUrl = `${endpointUrl}?apikey=${authContext.key}`;
      console.log(`Connecting to websocket... (using ${endpointUrl})`);
      // setStatus(`Connecting to server...`);

      const socket = new WebSocket(socketUrl);

      socket.onopen = socketOnOpen;
      socket.onmessage = socketOnMessage;
      socket.onclose = socketOnClose;
      socket.onerror = socketOnError;

      socketRef.current = socket;
    }
  }

  function getLength(){
    return listFrames.length;
  }

  async function socketOnOpen() {
    console.log("Connected to websocket");
    // setStatus("Connecting to webcam...");
    if (recorderRef.current) {
      console.log("Video recorder found, will use open socket");
      await capturePhoto();
    } else {
      console.warn("No video recorder exists yet to use with the open socket");
    }
  }

  async function socketOnMessage(event: MessageEvent | null, notcollecting: boolean = false) {
    // setStatus(collect.toString());
    if(event != null){
      const response = JSON.parse(event.data);
      var currFrames = listFrames;
      currFrames.push(response);
      setListFrames(currFrames);
      // console.log("Got response", response);
      const predictions: FacePrediction[] = response.face?.predictions || [];
      const warning = response.face?.warning || "";
      const error = response.error;
      if (error) {
        // setStatus(error);
        console.error(error);
        stopEverything();
        return;
      }
  
      if (predictions.length === 0) {
        // setStatus(warning.replace(".", ""));
        setEmotions([]);
      }
  
      const newTrackedFaces: TrackedFace[] = [];
      predictions.forEach(async (pred: FacePrediction, dataIndex: number) => {
        newTrackedFaces.push({ boundingBox: pred.bbox });
        if (dataIndex === 0) {
          const newEmotions = pred.emotions;
          setEmotions(newEmotions);
          // console.log(newEmotions);
          if (onCalibrate) {
            onCalibrate(newEmotions);
          }
        }
      });
      setTrackedFaces(newTrackedFaces);
  
      await capturePhoto();
    } else {
      // if(status == "SWIPED"){
      //   setCollect(true);
      // }
    }
  }

  async function socketOnClose(event: CloseEvent) {
    console.log("Socket closed");

    if (mountRef.current === true) {
      // setStatus("Reconnecting");
      console.log("Component still mounted, will reconnect...");
      connect();
    } else {
      console.log("Component unmounted, will not reconnect...");
    }
  }

  async function socketOnError(event: Event) {
    console.error("Socket failed to connect: ", event);
    if (numReconnects.current >= maxReconnects) {
      // setStatus(`Failed to connect to the Hume API (${authContext.environment}).
      // Please log out and verify that your API key is correct.`);
      stopEverything();
    } else {
      numReconnects.current++;
      console.warn(`Connection attempt ${numReconnects.current}`);
    }
  }

  function stopEverything() {
    console.log("Stopping everything...");
    mountRef.current = false;
    const socket = socketRef.current;
    if (socket) {
      console.log("Closing socket");
      socket.close();
      socketRef.current = null;
    } else {
      console.warn("Could not close socket, not initialized yet");
    }
    const recorder = recorderRef.current;
    if (recorder) {
      console.log("Stopping recorder");
      recorder.stopRecording();
      recorderRef.current = null;
    } else {
      console.warn("Could not stop recorder, not initialized yet");
    }
  }

  async function onVideoReady(videoElement: HTMLVideoElement) {
    console.log("Video element is ready");

    if (!photoRef.current) {
      console.error("No photo element found");
      return;
    }

    if (!recorderRef.current && recorderCreated.current === false) {
      console.log("No recorder yet, creating one now");
      recorderCreated.current = true;
      const recorder = await VideoRecorder.create(videoElement, photoRef.current);

      recorderRef.current = recorder;
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("Socket open, will use the new recorder");
        await capturePhoto();
      } else {
        console.warn("No socket available for sending photos");
      }
    }
  }

  async function capturePhoto() {
    const recorder = recorderRef.current;

    if (!recorder) {
      console.error("No recorder found");
      return;
    }

    const photoBlob = await recorder.takePhoto();
    sendRequest(photoBlob);
  }

  async function sendRequest(photoBlob: Blob) {
    const socket = socketRef.current;

    if (!socket) {
      console.error("No socket found");
      return;
    }

    const encodedBlob = await blobToBase64(photoBlob);
    const requestData = JSON.stringify({
      data: encodedBlob,
      models: {
        face: {},
      },
    });

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(requestData);
    } else {
      console.error("Socket connection not open. Will not capture a photo");
      socket.close();
    }
  }

  async function getPhotoData(listAllFrames: Record<string, any>[], firstCall: boolean = false) {
    var inputData;
    if(firstCall){
      inputData = { "emotion_data": [], "swipe_direction": "left", "clothes_id": 0 };
    } else {
      var currFrameLength = listFrames.length - lastDate;
      var currList = listAllFrames.slice(-1 * currFrameLength);
      inputData = { "emotion_data": currList, "swipe_direction": currDirection, "clothes_id": clothesID };
    }
  
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");
  
    const raw = JSON.stringify(inputData);
  
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw
    };
  
    try {
        const response = await fetch("https://1dd8affc97d322.lhr.life/next_image", requestOptions);
        const text = await response.json();
        setRespNum(respNum + 1);
        var currArray = photos;
        var currLength = currArray.length;
        currArray.push(...text);
        console.log(currArray)
        setPhotos(currArray); // Update the photos array
        return text;
    } catch (error) {
        setDataResp(error.toString());
        console.error(error);
    }
  }
  

function callbackNewPhotos(currDate: Date, currDirection: string, clothesID: number){
  setStatus("UNSWIP");
  setCurrentDate(listFrames.length);
  setCollect(!collect);
  setDirection(currDirection);
  setClothesID(clothesID);
  // setCollect(collect + 1);
}
  // const photos = ["/first.png", "/second.png", "/first.png"]
  return (
    <div>
      {loaded && (
        <div className="md:flex">
          <FaceTrackedVideo
            className="mb-6"
            onVideoReady={onVideoReady}
            trackedFaces={trackedFaces}
            photos={photos}
            width={1000}
            height={375}
            callbackNewPhotos={callbackNewPhotos}
          />
          {!onCalibrate && (
            <div className="ml-10">
              {/* <TopEmotions emotions={emotions} />
              <LoaderSet
                className="mt-8 ml-5"
                emotionNames={loaderNames}
                emotions={emotions}
                numLevels={numLoaderLevels}
              /> */}
              <Descriptor className="mt-8" emotions={emotions} />
            </div>
          )}
        </div>
      )}

      <div className="pt-6">{status}</div>
      <canvas className="hidden" ref={photoRef}></canvas>
    </div>
  );
}

FaceWidgets.defaultProps = {
  onCalibrate: None,
};

