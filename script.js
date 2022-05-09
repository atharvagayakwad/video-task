const message = document.getElementById("message");
const { createWorker } = FFmpeg;

const worker = createWorker({
  progress: ({ ratio }) => {
    message.innerHTML = `Complete: ${(ratio * 100.0).toFixed(2)}%`;
  },
  logger: (data) => console.log("logger", data),
});

const concat = async ({ target: { files } }) => {
  message.innerHTML = "Loading ffmpeg-core.js";
  await worker.load();

  const names = [];
  for (const f of files) {
    const { name } = f;
    await worker.write(name, f);
    const data = await worker.transcode(name, name + ".mp4");
    names.push(name + ".mp4");
    console.log("data", data);
  }

  message.innerHTML = "Start concating";
  await worker.concatDemuxer(names, "output.mp4");

  message.innerHTML = "Complete concating";
  const { data } = await worker.read("output.mp4");

  console.log("data", data);

  const video = document.getElementById("output-video");
  video.src = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mp4" })
  );
};

document.getElementById("uploader").addEventListener("change", concat);
