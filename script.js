const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.querySelector('.progress-container');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const coverImg = document.getElementById('cover-img');
const fileInput = document.getElementById('file-input');
const songList = document.getElementById('song-list');

// Songs array to store song objects
let songs = [];

// Track current song index
let songIndex = 0;
let isLooping = false;

// Initially load song details into DOM
function loadSong(song) {
    // Removing highlight from previously highlighted song
    const currentlyPlaying = document.querySelector('.highlighted');
    if(currentlyPlaying)
        currentlyPlaying.classList.remove('highlighted');

    const songItems = document.querySelectorAll('#song-list li');
    songItems[songIndex].classList.add('highlighted');

    title.innerText = song.displayName;
    artist.innerText = song.artist;
    audio.src = URL.createObjectURL(song.file);

    // Check for cover image and set it
    if (song.cover) {
        coverImg.src = song.cover;
    } else {
        coverImg.src = 'music-logo.png';
    }
}

// Play song
function playSong() {
    playBtn.querySelector('i.fas').classList.remove('fa-play');
    playBtn.querySelector('i.fas').classList.add('fa-pause');
    audio.play();

    // Highlighting the current song playing
    const songItems = document.querySelectorAll('#song-list li');
    songItems[songIndex].classList.add('highlighted');
}

// Pause song
function pauseSong() {
    playBtn.querySelector('i.fas').classList.remove('fa-pause');
    playBtn.querySelector('i.fas').classList.add('fa-play');
    audio.pause();
}

// Previous song
function prevSong() {
    songIndex--;
    if (songIndex < 0) {
        songIndex = songs.length - 1;
    }
    loadSong(songs[songIndex]);
    playSong();
}

// Next song
function nextSong() {
    songIndex++;
    if (songIndex > songs.length - 1) {
        songIndex = 0;
    }
    loadSong(songs[songIndex]);
    playSong();
}

// Update progress bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
}

// Set progress bar
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// Handle song file input
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    for (const file of files) {
        const song = {
            file: file,
            displayName: file.name.split('.').slice(0, -1).join('.'),
            artist: 'Unknown Artist', // You can add functionality to extract artist name if metadata is available
            cover: 'music-logo.png' // You can add functionality to extract cover if metadata is available
        };
        songs.push(song);
        addSongToList(song, songs.length - 1);
    }
    if (songs.length > 0) {
        loadSong(songs[songIndex]);
    }
});

// Add song to the song list
function addSongToList(song, index) {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${song.displayName}`;

    // Create and add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.addEventListener('click', (e) => 
    {
        e.stopPropagation();
        deleteSong(index);
    });
    li.appendChild(deleteBtn);

    li.addEventListener('click', () => {
        songIndex = index;
        loadSong(song);
        playSong();
    });
    songList.appendChild(li);
}

// Function to delete a song
function deleteSong(index) {
    // Remove song from the songs array
    songs.splice(index, 1);

    // Remove song from the DOM
    const songItems = document.querySelectorAll('#song-list li');
    songItems[index].remove();

    updateSongList();

    // If the deleted song is currently playing, load the next song
    if (index === songIndex) {
        if (songs.length > 0) {
            songIndex = (index === songs.length) ? 0 : index;
            loadSong(songs[songIndex]);
            playSong();
        } else {
            // If no songs left, pause and reset the player
            pauseSong();
            audio.src = '';
            title.innerText = 'Song Title';
            artist.innerText = 'Artist Name';
        }
    } else if (index < songIndex) {
        // Adjust song index if a song before the current song was deleted
        songIndex--;
    }
}

// Function to update the song list numbering
function updateSongList() {
    // Clear the current song list in the DOM
    songList.innerHTML = '';
    // Re-add all songs with updated numbering
    songs.forEach((song, index) => {
        addSongToList(song, index);
    });
}

// Event listeners
playBtn.addEventListener('click', () => {
    const isPlaying = playBtn.querySelector('i.fas').classList.contains('fa-pause');
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
progressContainer.addEventListener('click', setProgress);
audio.addEventListener('ended', nextSong);
