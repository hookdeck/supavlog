const VIDEO_MAX_LENGTH = parseInt(
  process.env.NEXT_PUBLIC_VIDEO_MAX_LENGTH + ""
);

const Config = {
  VIDEO_MAX_LENGTH: isNaN(VIDEO_MAX_LENGTH) == false ? VIDEO_MAX_LENGTH : 60,
};

export default Config;
