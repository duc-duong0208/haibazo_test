import React, { useState, useMemo, useEffect, useRef } from "react";

import InputCommon from "../Input/InputCommon";
import ButtonCommon from "../button/ButtonCommon";
import { AutoPlayType, CircleType, Status } from "../../utils/type";

const Game = () => {
  const [points, setPoints] = useState<null | number>(null);
  const [circles, setCircles] = useState<CircleType[]>([]);
  const [statusGame, setStatusGame] = useState<Status | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoPlayType, setAutoPlayType] = useState<AutoPlayType>("off");

  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const currentNumberRef = useRef<number>(1);

  const title = useMemo(() => {
    switch (statusGame) {
      case "win":
        return { text: "ALL CLEARED", color: "text-green-600" };
      case "game_over":
        return { text: "GAME OVER", color: "text-red-600" };
      default:
        return { text: "LET'S PLAY", color: "text-black" };
    }
  }, [statusGame]);

  const startGame = () => {
    if (points) {
      let newCircles: CircleType[] = [];
      for (let i = 1; i <= points; i++) {
        newCircles.push({
          number: i,
          top: Math.random() * 90,
          left: Math.random() * 90,
          countdown: 3.0,
          isActive: false,
        });
      }
      setCircles(newCircles);
      currentNumberRef.current = 1;
      setStatusGame("start");
      setTimer(0);
      setIsPlaying(true);
    }
  };

  const handleCircleClick = (clickedCircle: CircleType) => {
    if (statusGame === "game_over") {
      return;
    }
    if (clickedCircle.number === currentNumberRef.current) {
      currentNumberRef.current += 1;
      activateCircle(clickedCircle.number);
    } else {
      setStatusGame("game_over");
      setIsPlaying(false);
      setCircles((prev) =>
        prev.map((circle) => {
          if (circle.number === clickedCircle.number) {
            return { ...circle, isActive: true };
          }
          return circle;
        })
      );
      countdownIntervalsRef.current.forEach((interval) =>
        clearInterval(interval)
      );
      countdownIntervalsRef.current.clear();
    }
  };

  const activateCircle = (circleNumber: number) => {
    setCircles((prev) =>
      prev.map((circle) => {
        if (circle.number === circleNumber) {
          return { ...circle, isActive: true };
        }
        return circle;
      })
    );

    const countdownInterval = setInterval(() => {
      setCircles((prev) =>
        prev
          .map((circle) => {
            if (circle.number === circleNumber && circle.isActive) {
              return { ...circle, countdown: circle.countdown - 0.1 };
            }
            return circle;
          })
          .filter((circle) => circle.countdown > 0)
      );
    }, 100);

    countdownIntervalsRef.current.set(circleNumber, countdownInterval);

    setTimeout(() => clearInterval(countdownInterval), 3000);
  };

  const handleAutoPlay = () => {
    if (autoPlayType === "off") {
      setAutoPlayType("on");
      autoPlayNextCircle(currentNumberRef.current);
    } else {
      setAutoPlayType("off");
      if (autoPlayIntervalRef.current) {
        clearTimeout(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }
  };

  const autoPlayNextCircle = (circleNumber: number) => {
    if (!points || currentNumberRef.current > points) {
      return;
    }
    const circle = circles.find((c) => c.number === circleNumber);
    if (circle) {
      handleCircleClick(circle);
    }
    autoPlayIntervalRef.current = setTimeout(() => {
      autoPlayNextCircle(currentNumberRef.current);
    }, 1000);
  };

  // --------------------useEffect--------------------
  useEffect(() => {
    if (autoPlayType === "off" && autoPlayIntervalRef.current) {
      clearTimeout(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
  }, [autoPlayType]);

  useEffect(() => {
    if (points && currentNumberRef.current > points) {
      const allCountdownsFinished = circles.every(
        (circle) => circle.countdown <= 0 && circle.isActive
      );
      if (allCountdownsFinished) {
        setStatusGame("win");
        setIsPlaying(false);
        setAutoPlayType("off");
      }
    }
  }, [circles, currentNumberRef, points]);

  useEffect(() => {
    if (isPlaying) {
      timeIntervalRef.current = setInterval(
        () => setTimer((prev) => prev + 0.1),
        100
      );
    }
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (statusGame === "game_over") {
      countdownIntervalsRef.current.forEach((interval) =>
        clearInterval(interval)
      );
      countdownIntervalsRef.current.clear();
      setAutoPlayType("off");
    }
  }, [statusGame]);

  return (
    <div className="w-[500px] h-[700px] flex flex-col items-start gap-2 p-5 border border-black">
      <p className={`font-bold ${title.color}`}>{title.text}</p>
      <div className="w-full flex">
        <p className="w-[100px] text-left">Points:</p>
        <InputCommon value={points} setValue={setPoints} />
      </div>
      <div className="w-full flex">
        <p className="w-[100px] text-left">Time:</p>
        <span>{timer.toFixed(1)}s</span>
      </div>
      {statusGame ? (
        <div className="flex gap-3">
          <ButtonCommon title="Restart" onClick={startGame} />
          {statusGame === "start" ? (
            autoPlayType === "on" ? (
              <ButtonCommon title="Auto Play OFF" onClick={handleAutoPlay} />
            ) : (
              <ButtonCommon title="Auto Play ON" onClick={handleAutoPlay} />
            )
          ) : (
            ""
          )}
        </div>
      ) : (
        <ButtonCommon title="Play" onClick={startGame} />
      )}

      <div className="relative w-full h-full border border-black">
        {circles &&
          circles.map((circle) => (
            <div
              key={circle.number}
              className={`absolute w-10 h-10 flex flex-col items-center justify-center rounded-full border border-red-500 cursor-pointer ${
                circle.isActive ? "bg-red-500" : "bg-white"
              }`}
              style={{
                left: `${circle.left}%`,
                top: `${circle.top}%`,
                opacity: circle.isActive ? circle.countdown / 3 : 1,
                transition: "opacity 0.1s linear",
              }}
              onClick={() => handleCircleClick(circle)}
            >
              <span className="leading-none text-xs">{circle.number}</span>
              {circle.isActive && (
                <div className="leading-none text-xs text-white">
                  {circle.countdown.toFixed(1)}s
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Game;
