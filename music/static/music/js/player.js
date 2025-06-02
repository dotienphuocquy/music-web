document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-button');
    const rewindButton = document.getElementById('rewind-button');
    const forwardButton = document.getElementById('forward-button');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const volumeButton = document.getElementById('volume-button');
    const volumeSliderFill = document.getElementById('volume-slider-fill');
    const volumeSlider = document.querySelector('.player-volume-slider');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const currentSongImage = document.getElementById('current-song-image');
    
    let isPlaying = false;
    
    // Khôi phục trạng thái phát nhạc từ localStorage khi trang được tải
    function restorePlayerState() {
        const playerState = JSON.parse(localStorage.getItem('playerState'));
        if (playerState) {
            // Khôi phục thông tin bài hát
            currentSongTitle.textContent = playerState.title || '';
            currentSongArtist.textContent = playerState.artist || '';
            
            if (playerState.image) {
                currentSongImage.src = playerState.image;
                currentSongImage.style.display = 'block';
            } else {
                currentSongImage.style.display = 'none';
            }
            
            // Khôi phục nguồn âm thanh
            if (playerState.songUrl) {
                audioPlayer.src = playerState.songUrl;
                
                // Khôi phục vị trí phát
                if (playerState.currentTime) {
                    audioPlayer.currentTime = playerState.currentTime;
                }
                
                // Khôi phục trạng thái phát/tạm dừng
                if (playerState.isPlaying) {
                    audioPlayer.play().then(() => {
                        isPlaying = true;
                        updatePlayButton();
                    }).catch(error => {
                        console.error('Không thể tự động phát nhạc:', error);
                        isPlaying = false;
                        updatePlayButton();
                    });
                } else {
                    isPlaying = false;
                    updatePlayButton();
                }
                
                // Khôi phục âm lượng
                if (playerState.volume !== undefined) {
                    audioPlayer.volume = playerState.volume;
                    volumeSliderFill.style.width = (playerState.volume * 100) + '%';
                    updateVolumeIcon();
                }
            }
        }
    }
    
    // Lưu trạng thái phát nhạc vào localStorage
    function savePlayerState() {
        if (audioPlayer.src) {
            const playerState = {
                songUrl: audioPlayer.src,
                title: currentSongTitle.textContent,
                artist: currentSongArtist.textContent,
                image: currentSongImage.style.display !== 'none' ? currentSongImage.src : null,
                currentTime: audioPlayer.currentTime,
                duration: audioPlayer.duration,
                isPlaying: isPlaying,
                volume: audioPlayer.volume
            };
            localStorage.setItem('playerState', JSON.stringify(playerState));
        }
    }
    
    // Lưu trạng thái phát nhạc mỗi giây và trước khi rời trang
    setInterval(savePlayerState, 1000);
    window.addEventListener('beforeunload', savePlayerState);
    
    // Khôi phục trạng thái phát nhạc khi trang được tải
    restorePlayerState();
    
    // Collect all play buttons on the page
    const playButtons = document.querySelectorAll('.play-song, .card-play-button');
    
    // Add event listeners to all play buttons
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const songUrl = this.getAttribute('data-song-url');
            const songTitle = this.getAttribute('data-song-title');
            const songArtist = this.getAttribute('data-song-artist');
            const songImage = this.getAttribute('data-song-image');
            const songId = this.getAttribute('data-song-id');
            
            playSong(songUrl, songTitle, songArtist, songImage, songId);
        });
    });
    
    function playSong(url, title, artist, image, songId) {
        // Nếu đang phát cùng một bài hát, chỉ chuyển đổi giữa phát và tạm dừng
        console.log('Phát bài hát:', { url, title, artist, image, songId });
        if (audioPlayer.src === url) {
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
            } else {
                audioPlayer.play();
                isPlaying = true;
            }
            updatePlayButton();
            return;
        }
        
        // Nếu là bài hát mới, cập nhật nguồn và phát
        audioPlayer.src = url;
        audioPlayer.play();
        isPlaying = true;
        updatePlayButton();
        
        currentSongTitle.textContent = title || 'Không có tiêu đề';
        currentSongArtist.textContent = artist || 'Không có nghệ sĩ';
        
        if (image) {
            currentSongImage.src = image;
            currentSongImage.style.display = 'block';
        } else {
            currentSongImage.style.display = 'none';
        }
        
        // Lưu trạng thái ngay lập tức
        savePlayerState();
    }
    
    function updatePlayButton() {
        if (isPlaying) {
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    // Play/Pause button
    playButton.addEventListener('click', function() {
        if (audioPlayer.src) {
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
            isPlaying = !isPlaying;
            updatePlayButton();
            savePlayerState();
        }
    });
    
    // Fast forward button (forward 10 seconds)
    forwardButton.addEventListener('click', function() {
        if (audioPlayer.src) {
            audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
            savePlayerState();
        }
    });
    
    // Rewind button (rewind 10 seconds)
    rewindButton.addEventListener('click', function() {
        if (audioPlayer.src) {
            audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
            savePlayerState();
        }
    });
    
    // Update progress bar and time displays
    audioPlayer.addEventListener('timeupdate', function() {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        if (!isNaN(duration)) {
            // Update progress bar
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = progressPercent + '%';
            
            // Update time displays
            currentTimeDisplay.textContent = formatTime(currentTime);
            durationDisplay.textContent = formatTime(duration);
        }
    });
    
    // Click on progress bar to seek
    progressContainer.addEventListener('click', function(e) {
        if (audioPlayer.src) {
            const rect = this.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = clickPosition * audioPlayer.duration;
            savePlayerState();
        }
    });
    
    // Volume control
    volumeSlider.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        audioPlayer.volume = clickPosition;
        volumeSliderFill.style.width = (clickPosition * 100) + '%';
        updateVolumeIcon();
        savePlayerState();
    });
    
    volumeButton.addEventListener('click', function() {
        if (audioPlayer.volume > 0) {
            audioPlayer.volume = 0;
            volumeSliderFill.style.width = '0%';
        } else {
            audioPlayer.volume = 1;
            volumeSliderFill.style.width = '100%';
        }
        updateVolumeIcon();
        savePlayerState();
    });
    
    function updateVolumeIcon() {
        if (audioPlayer.volume === 0) {
            volumeButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (audioPlayer.volume < 0.5) {
            volumeButton.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    // Format time (seconds) to MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return minutes + ':' + (secs < 10 ? '0' : '') + secs;
    }
    
    // Handle audio ended event
    audioPlayer.addEventListener('ended', function() {
        isPlaying = false;
        updatePlayButton();
        progressBar.style.width = '0%';
        savePlayerState();
    });
    
    // Handle audio metadata loaded
    audioPlayer.addEventListener('loadedmetadata', function() {
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', function(e) {
    // Skip keyboard shortcuts if user is typing in an input field or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Only handle shortcuts if a song is loaded
    if (!audioPlayer.src) return;
    
    switch(e.code) {
        case 'Space': // Play/Pause with Space
            e.preventDefault();
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
            isPlaying = !isPlaying;
            updatePlayButton();
            savePlayerState();
            break;
        case 'ArrowRight': // Forward 5 seconds with Right Arrow
            audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 5, audioPlayer.duration);
            savePlayerState();
            break;
        case 'ArrowLeft': // Rewind 5 seconds with Left Arrow
            audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
            savePlayerState();
            break;
        case 'ArrowUp': // Increase volume with Up Arrow
            e.preventDefault();
            audioPlayer.volume = Math.min(audioPlayer.volume + 0.1, 1);
            volumeSliderFill.style.width = (audioPlayer.volume * 100) + '%';
            updateVolumeIcon();
            savePlayerState();
            break;
        case 'ArrowDown': // Decrease volume with Down Arrow
            e.preventDefault();
            audioPlayer.volume = Math.max(audioPlayer.volume - 0.1, 0);
            volumeSliderFill.style.width = (audioPlayer.volume * 100) + '%';
            updateVolumeIcon();
            savePlayerState();
            break;
    }
});
});

playButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const songUrl = this.getAttribute('data-song-url');
        const songTitle = this.getAttribute('data-song-title');
        const songArtist = this.getAttribute('data-song-artist');
        const songImage = this.getAttribute('data-song-image');
        const songId = this.getAttribute('data-song-id');
        playSong(songUrl, songTitle, songArtist, songImage, songId);
    });
});