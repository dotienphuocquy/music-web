document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("player");
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const seekSlider = document.getElementById("seekSlider");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");

  //  Lấy link bài hát trước và sau
  const nextUrl = player.dataset.nextUrl;
  const prevUrl = player.dataset.prevUrl;
  function tryAutoplay() {
    audio
      .play()
      .then(() => {
        playBtn.textContent = "⏸"; // Đổi thành dấu ⏸ khi phát
      })
      .catch((e) => {
        playBtn.textContent = "▶"; // Đổi lại nếu không thể autoplay
        playBtn.addEventListener(
          "click",
          function firstClick() {
            audio.play();
            playBtn.textContent = "⏸";
            playBtn.removeEventListener("click", firstClick);
          },
          { once: true }
        );
      });
  }
  // Hàm định dạng thời gian
  function formatTime(t) {
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  }

  //Khi audio tải xong thông tin (kích thước, thời lượng...)
  audio.addEventListener("loadedmetadata", () => {
    seekSlider.max = Math.floor(audio.duration);
    durationEl.textContent = formatTime(audio.duration);
  });
  //Cập nhật thanh tiến trình & thời gian hiện tại
  audio.addEventListener("timeupdate", () => {
    seekSlider.value = Math.floor(audio.currentTime);
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  //Tua nhạc khi người dùng kéo thanh tiến trình
  seekSlider.addEventListener("input", () => {
    audio.currentTime = seekSlider.value;
  });

  //Nút Play/Pause
  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playBtn.textContent = "▶";
      console.log("Audio paused", audio.paused);
    }
  });

  //Khi bài hát phát xong thì tự chuyển bài
  audio.addEventListener("ended", () => {
    if (nextUrl) {
      window.location.href = nextUrl;
    }
  });

  //Nút Next và Previous
  nextBtn.addEventListener("click", () => {
    if (nextUrl) {
      window.location.href = nextUrl;
    }
  });

  prevBtn.addEventListener("click", () => {
    if (prevUrl) {
      window.location.href = prevUrl;
    }
  });

  if (audio.readyState > 3) {
    tryAutoplay();
  } else {
    audio.addEventListener("canplaythrough", tryAutoplay);
  }
});
