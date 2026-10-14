import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  ListVideo,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import type { LiveClass } from '../types/live-class.types';

import { get } from '../../../services/api';

interface ViewRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveClass: LiveClass | null;
}

interface Recording {
  id: number;
  meeting_id: string;
  file_path: string;
  video_url?: string | null;
  recorded_at?: string | null;
  duration?: number | null;
  file_size?: number | null;
  recording_title?: string | null;
}

interface LiveClassRecordingResponse {
  status: string;
  data: {
    id: number;
    title: string;
    meeting_id: string;
    duration: number;
    start_time: string;
    description?: string | null;
    recordings?: Recording[];
  };
}

export const ViewRecordingModal: React.FC<
  ViewRecordingModalProps
> = ({
  isOpen,
  onClose,
  liveClass,
}) => {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const [recording, setRecording] =
    useState<Recording | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [videoDuration, setVideoDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  /**
   * --------------------------------------------------
   * LOAD RECORDING
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!isOpen || !liveClass) {
      return;
    }

    let cancelled = false;

    const loadRecording = async () => {
      try {
        setLoading(true);
        setError('');
        setRecording(null);

        setIsPlaying(false);
        setCurrentTime(0);
        setVideoDuration(0);

        const response =
          await get<LiveClassRecordingResponse>(
            `/admin/live-classes/${liveClass.id}`,
          );

        if (cancelled) {
          return;
        }

        const recordings =
          response?.data?.recordings ?? [];

        if (
          !Array.isArray(recordings) ||
          recordings.length === 0
        ) {
          setError(
            'No recording is available for this live class.',
          );

          return;
        }

        const firstRecording =
          recordings[0];

        if (
          !firstRecording.file_path &&
          !firstRecording.video_url
        ) {
          setError(
            'Recording file URL is not available.',
          );

          return;
        }

        setRecording(firstRecording);
      } catch (err) {
        console.error(
          'Failed to load recording:',
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load recording.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRecording();

    return () => {
      cancelled = true;
    };
  }, [isOpen, liveClass]);

  /**
   * --------------------------------------------------
   * CLEAN VIDEO WHEN MODAL CLOSES
   * --------------------------------------------------
   */
  useEffect(() => {
    if (!isOpen) {
      const video =
        videoRef.current;

      if (video) {
        video.pause();
        video.currentTime = 0;
      }

      setIsPlaying(false);
      setCurrentTime(0);
      setVideoDuration(0);
      setRecording(null);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !liveClass) {
    return null;
  }

  /**
   * --------------------------------------------------
   * VIDEO URL
   * --------------------------------------------------
   *
   * Backend should ideally return video_url as an
   * S3 signed URL.
   *
   * file_path is used as fallback.
   */
  const videoUrl =
    recording?.video_url ||
    recording?.file_path ||
    liveClass.recordingUrl ||
    '';

  /**
   * --------------------------------------------------
   * FORMAT TIME
   * --------------------------------------------------
   */
  const formatTime = (
    seconds: number,
  ): string => {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return '00:00';
    }

    const totalSeconds =
      Math.floor(seconds);

    const hours =
      Math.floor(
        totalSeconds / 3600,
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60,
      );

    const secs =
      totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        '0',
      )}:${String(minutes).padStart(
        2,
        '0',
      )}:${String(secs).padStart(
        2,
        '0',
      )}`;
    }

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(
      2,
      '0',
    )}`;
  };

  /**
   * --------------------------------------------------
   * PLAY / PAUSE
   * --------------------------------------------------
   */
  const togglePlay = async () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error(
        'Video play failed:',
        err,
      );

      setError(
        'Unable to play this recording. Please check the video URL.',
      );
    }
  };

  /**
   * --------------------------------------------------
   * MUTE
   * --------------------------------------------------
   */
  const toggleMute = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;

    setIsMuted(video.muted);
  };

  /**
   * --------------------------------------------------
   * RESTART
   * --------------------------------------------------
   */
  const restartVideo = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;

    setCurrentTime(0);
  };

  /**
   * --------------------------------------------------
   * SEEK
   * --------------------------------------------------
   */
  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const newTime =
      Number(e.target.value);

    video.currentTime = newTime;

    setCurrentTime(newTime);
  };

  /**
   * --------------------------------------------------
   * VOLUME
   * --------------------------------------------------
   */
  const handleVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const newVolume =
      Number(e.target.value);

    video.volume = newVolume;

    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }

    setVolume(newVolume);
  };

  /**
   * --------------------------------------------------
   * VIDEO EVENTS
   * --------------------------------------------------
   */
  const handleLoadedMetadata = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    if (
      Number.isFinite(
        video.duration,
      )
    ) {
      setVideoDuration(
        video.duration,
      );
    }
  };

  const handleTimeUpdate = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    setCurrentTime(
      video.currentTime,
    );
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  /**
   * --------------------------------------------------
   * DOWNLOAD
   * --------------------------------------------------
   */
  const handleDownload = () => {
    if (!videoUrl) {
      return;
    }

    const link =
      document.createElement('a');

    link.href = videoUrl;

    link.target = '_blank';

    link.rel =
      'noopener noreferrer';

    link.download =
      `${liveClass.title}.mp4`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /**
   * --------------------------------------------------
   * SHARE
   * --------------------------------------------------
   */
  const handleShare = async () => {
    if (!videoUrl) {
      return;
    }

    try {
      if (
        typeof navigator.share ===
        'function'
      ) {
        await navigator.share({
          title:
            liveClass.title,
          text:
            `Recording: ${liveClass.title}`,
          url: videoUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(
        videoUrl,
      );

      alert(
        'Recording link copied to clipboard!',
      );
    } catch (err) {
      console.error(
        'Share failed:',
        err,
      );
    }
  };

  /**
   * --------------------------------------------------
   * CLOSE
   * --------------------------------------------------
   */
  const handleClose = () => {
    const video =
      videoRef.current;

    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setIsPlaying(false);

    onClose();
  };

  const totalDuration =
    videoDuration ||
    Number(recording?.duration ?? 0) ||
    Number(
      liveClass.duration ?? 0,
    ) * 60;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/80
        backdrop-blur-md
        p-3 sm:p-6
        overflow-y-auto
      "
    >
      <div
        className="
          relative flex flex-col
          w-full max-w-5xl
          rounded-2xl
          border border-slate-800
          bg-slate-900
          shadow-2xl
          overflow-hidden
          animate-in fade-in zoom-in-95
          text-white
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}
        <div
          className="
            flex items-center
            justify-between
            px-5 py-3.5
            border-b border-slate-800
          "
        >
          <div className="min-w-0">
            <span
              className="
                inline-flex
                rounded
                bg-blue-500/20
                px-2 py-0.5
                text-[10px]
                font-bold
                text-blue-400
              "
            >
              ARCHIVED RECORDING
            </span>

            <h2
              className="
                mt-1
                text-sm sm:text-base
                font-bold
                text-white
                truncate
                max-w-lg
              "
            >
              {liveClass.title}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="
              flex h-8 w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-800
              hover:text-white
              transition-colors
            "
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ==================================================
            VIDEO PLAYER
        ================================================== */}
        <div
          className="
            relative
            aspect-video
            w-full
            bg-black
            flex
            items-center
            justify-center
            overflow-hidden
          "
        >
          {/* LOADING */}
          {loading && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-3
                text-slate-400
              "
            >
              <Loader2
                className="
                  h-8 w-8
                  animate-spin
                  text-blue-500
                "
              />

              <span className="text-sm">
                Loading recording...
              </span>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-3
                px-6
                text-center
              "
            >
              <AlertCircle
                className="
                  h-10 w-10
                  text-amber-400
                "
              />

              <p
                className="
                  text-sm
                  text-slate-300
                  max-w-md
                "
              >
                {error}
              </p>
            </div>
          )}

          {/* VIDEO */}
          {!loading &&
            !error &&
            recording &&
            videoUrl && (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={
                    liveClass.thumbnail ||
                    undefined
                  }
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-contain
                    bg-black
                  "
                  preload="metadata"
                  playsInline
                  onLoadedMetadata={
                    handleLoadedMetadata
                  }
                  onTimeUpdate={
                    handleTimeUpdate
                  }
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onEnded={handleEnded}
                  onClick={togglePlay}
                />

                {/* BIG PLAY BUTTON */}
                {!isPlaying && (
                  <button
                    onClick={
                      togglePlay
                    }
                    className="
                      absolute
                      z-10
                      flex
                      h-16 w-16
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-600/90
                      text-white
                      shadow-2xl
                      hover:bg-blue-600
                      hover:scale-110
                      transition-all
                    "
                    aria-label="Play"
                  >
                    <Play
                      className="
                        h-8 w-8
                        fill-white
                        ml-1
                      "
                    />
                  </button>
                )}

                {/* ==================================================
                    VIDEO CONTROLS
                ================================================== */}
                <div
                  className="
                    absolute
                    bottom-0
                    inset-x-0
                    z-20
                    bg-gradient-to-t
                    from-black/95
                    via-black/60
                    to-transparent
                    p-4
                    pt-10
                    flex
                    flex-col
                    gap-2
                  "
                >
                  {/* SEEK BAR */}
                  <input
                    type="range"
                    min={0}
                    max={
                      totalDuration || 0
                    }
                    step={0.1}
                    value={Math.min(
                      currentTime,
                      totalDuration ||
                        0,
                    )}
                    onChange={
                      handleSeek
                    }
                    className="
                      w-full
                      accent-blue-500
                      cursor-pointer
                    "
                    aria-label="Video progress"
                  />

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      text-xs
                      text-slate-300
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      {/* PLAY / PAUSE */}
                      <button
                        onClick={
                          togglePlay
                        }
                        className="
                          hover:text-white
                          transition-colors
                        "
                        aria-label={
                          isPlaying
                            ? 'Pause'
                            : 'Play'
                        }
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>

                      {/* RESTART */}
                      <button
                        onClick={
                          restartVideo
                        }
                        className="
                          hover:text-white
                          transition-colors
                        "
                        aria-label="Restart"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      {/* MUTE */}
                      <button
                        onClick={
                          toggleMute
                        }
                        className="
                          hover:text-white
                          transition-colors
                        "
                        aria-label={
                          isMuted
                            ? 'Unmute'
                            : 'Mute'
                        }
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>

                      {/* VOLUME */}
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={
                          isMuted
                            ? 0
                            : volume
                        }
                        onChange={
                          handleVolumeChange
                        }
                        className="
                          hidden
                          sm:block
                          w-16
                          accent-blue-500
                        "
                        aria-label="Volume"
                      />

                      {/* TIME */}
                      <span
                        className="
                          font-mono
                          text-[11px]
                          whitespace-nowrap
                        "
                      >
                        {formatTime(
                          currentTime,
                        )}{' '}
                        /{' '}
                        {formatTime(
                          totalDuration,
                        )}
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          rounded
                          bg-white/10
                          px-2
                          py-0.5
                          text-[10px]
                          font-bold
                        "
                      >
                        HD Recording
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>

        {/* ==================================================
            RECORDING INFORMATION
        ================================================== */}
        <div
          className="
            p-5
            bg-slate-900
            border-t border-slate-800
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >
          {/* LEFT */}
          <div>
            <h4
              className="
                flex
                items-center
                gap-1.5
                text-xs
                font-bold
                text-slate-300
                mb-2
              "
            >
              <ListVideo
                className="
                  h-4 w-4
                  text-blue-400
                "
              />

              <span>
                Recording Information
              </span>
            </h4>

            <div
              className="
                rounded-xl
                border border-slate-800
                bg-slate-800/40
                p-3
                space-y-2
                text-xs
              "
            >
              {/* RECORDING */}
              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-slate-400
                "
              >
                <span>
                  Recording:
                </span>

                <span
                  className="
                    font-bold
                    text-white
                    text-right
                    truncate
                    max-w-[250px]
                  "
                >
                  {recording?.recording_title ||
                    liveClass.title}
                </span>
              </div>

              {/* DURATION */}
              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-slate-400
                "
              >
                <span>
                  Duration:
                </span>

                <span
                  className="
                    font-bold
                    text-white
                  "
                >
                  {formatTime(
                    totalDuration,
                  )}
                </span>
              </div>

              {/* RECORDED DATE */}
              <div
                className="
                  flex
                  justify-between
                  gap-3
                  text-slate-400
                "
              >
                <span>
                  Recorded Date:
                </span>

                <span
                  className="
                    font-bold
                    text-white
                    text-right
                  "
                >
                  {recording?.recorded_at
                    ? new Date(
                        recording.recorded_at,
                      ).toLocaleString(
                        'en-IN',
                      )
                    : liveClass.startTime}
                </span>
              </div>

              {/* FILE SIZE */}
              {recording?.file_size !=
                null && (
                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    text-slate-400
                  "
                >
                  <span>
                    File Size:
                  </span>

                  <span
                    className="
                      font-bold
                      text-white
                    "
                  >
                    {(
                      Number(
                        recording.file_size,
                      ) /
                      (1024 * 1024)
                    ).toFixed(2)}{' '}
                    MB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="
              flex
              flex-col
              justify-end
            "
          >
            <div
              className="
                rounded-xl
                border border-blue-500/10
                bg-blue-500/5
                p-3
                text-xs
                text-slate-400
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span>
                  Status
                </span>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    font-semibold
                    text-emerald-400
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-emerald-400
                    "
                  />

                  Recording Available
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div
              className="
                flex
                items-center
                gap-2
                mt-4
              "
            >
              <button
                disabled={!videoUrl}
                onClick={
                  handleDownload
                }
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  bg-blue-600
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-white
                  hover:bg-blue-700
                  transition-colors
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <Download
                  className="
                    h-3.5 w-3.5
                  "
                />

                <span>
                  Download MP4
                </span>
              </button>

              <button
                disabled={!videoUrl}
                onClick={
                  handleShare
                }
                className="
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  border border-slate-700
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-slate-300
                  hover:bg-slate-800
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <Share2
                  className="
                    h-3.5 w-3.5
                  "
                />

                <span>
                  Share Link
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};