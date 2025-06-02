from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import *
from django.db.models import Q, Avg
from django.shortcuts import render, get_object_or_404
from .forms import SongUploadForm
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.http import require_POST
import json

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('/home')  # chuyển đến trang chính
        else:
            messages.error(request, 'Sai tài khoản hoặc mật khẩu')
    return render(request, 'music/login.html')

def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        if password != confirm_password:
            messages.error(request, 'Mật khẩu không khớp')
        elif User.objects.filter(username=username).exists():
            messages.error(request, 'Tài khoản đã tồn tại')
        else:
            User.objects.create_user(username=username, password=password)
            messages.success(request, 'Đăng ký thành công. Mời bạn đăng nhập')
            return redirect('login')
            
    return render(request, 'music/register.html')

def logout_view(request):
    logout(request)
    return redirect('/')
 
def get_common_context(request, query=None):
    if query:
        songs = Song.objects.filter(
            Q(title__icontains=query) | Q(artist__name__icontains=query)
        ).annotate(average_rating=Avg('ratings__rating'))
        artists = Artist.objects.filter(name__icontains=query)
    else:
        songs = Song.objects.annotate(average_rating=Avg('ratings__rating'))
        artists = Artist.objects.all()[:5]
    playlists = Playlist.objects.filter(user=request.user) if request.user.is_authenticated else []
    favorite_songs = Song.objects.filter(favorited_by__user=request.user) if request.user.is_authenticated else []
    return {
        'songs': songs,
        'artists': artists,
        'playlists': playlists,
        'favorite_songs': favorite_songs,
        'query': query,
    }

@login_required
def home_view(request):
    context = get_common_context(request)
    return render(request, 'music/home.html', context)

def index_view(request):
    query = request.GET.get('q')
    context = get_common_context(request, query)
    return render(request, 'music/index.html', context)

def play_song(request, song_id):
    song = get_object_or_404(Song, id=song_id)
    songs = list(Song.objects.all())
    current_index = songs.index(song)
    next_song = songs[current_index + 1] if current_index + 1 < len(songs) else None
    prev_song = songs[current_index - 1] if current_index > 0 else None

    # Tính số sao trung bình và kiểm tra đánh giá của người dùng
    average_rating = Rating.objects.filter(song=song).aggregate(avg=Avg('rating'))['avg']
    if average_rating is not None:
        average_rating = round(average_rating, 1)
    user_rating = None
    if request.user.is_authenticated:
        user_rating_obj = Rating.objects.filter(song=song, user=request.user).first()
        user_rating = user_rating_obj.rating if user_rating_obj else 0

    all_songs = Song.objects.exclude(id=song_id)
    return render(request, 'music/play_song.html', {
        'song': song,
        'songs': all_songs,
        'next_song': next_song,
        'prev_song': prev_song,
        'playlist': Song.objects.all(),
        'average_rating': average_rating,
        'user_rating': user_rating,
        'show_footer': False,
        'rating_range': range(5, 0, -1),
    })

@login_required
def playlist(request):
    playlists = Playlist.objects.filter(user=request.user)
    return render(request, 'music/playlist.html', {'playlists': playlists})

@login_required
def create_playlist(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        if name:
            Playlist.objects.create(name=name, user=request.user)
    return redirect('playlist')

@login_required
def view_playlist(request, playlist_id):
    playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
    songs = PlaylistSong.objects.filter(playlist=playlist).select_related('song')
    all_songs = Song.objects.exclude(id__in=songs.values_list('song_id', flat=True))

    if request.method == 'POST':
        song_id = request.POST.get('song_id')
        song = get_object_or_404(Song, id=song_id)
        PlaylistSong.objects.get_or_create(playlist=playlist, song=song)
        return redirect('view_playlist', playlist_id=playlist_id)

    return render(request, 'music/view_playlist.html', {
        'playlist': playlist,
        'songs': songs,
        'all_songs': all_songs
    })

@login_required
def add_to_playlist(request, playlist_id, song_id):
    playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
    song = get_object_or_404(Song, id=song_id)
    PlaylistSong.objects.get_or_create(playlist=playlist, song=song)
    return redirect('view_playlist', playlist_id=playlist_id)

@login_required
def remove_from_playlist(request, playlist_id, song_id):
    PlaylistSong.objects.filter(playlist_id=playlist_id, song_id=song_id).delete()
    return redirect('view_playlist', playlist_id=playlist_id)


@login_required
def delete_playlist(request, playlist_id):
    playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
    playlist.delete()
    return redirect('playlist')

@login_required
def add_to_playlist_dropdown(request):
    if request.method == "POST":
        playlist_id = request.POST.get("playlist_id")
        song_id = request.POST.get("song_id")
        if playlist_id and song_id:
            playlist = get_object_or_404(Playlist, id=playlist_id, user=request.user)
            song = get_object_or_404(Song, id=song_id)
            PlaylistSong.objects.get_or_create(playlist=playlist, song=song)
    return redirect('home')  # hoặc 'index_view' nếu bạn dùng trang đó để hiển thị danh sách bài hát


def artist_detail(request, artist_id):
    artist = get_object_or_404(Artist, id=artist_id)
    songs = Song.objects.filter(artist=artist)
    return render(request, 'music/artist_detail.html', {'artist': artist, 'songs': songs})


def search_view(request):
    query = request.GET.get('q')
    context = get_common_context(request, query)
    return render(request, 'music/search.html', context)

@login_required
def favorite_songs(request):
    if not request.user.is_authenticated:
        return redirect("login")  # Nếu chưa đăng nhập, chuyển hướng về trang login

    favorites = FavoriteSong.objects.filter(user=request.user).select_related("song")

    return render(request, "music/favorites.html", {"favorites": favorites})
@login_required
def add_favorite(request, song_id):
    song = get_object_or_404(Song, id=song_id)
    FavoriteSong.objects.get_or_create(user=request.user, song=song)
    return redirect('home')

@login_required
def remove_favorite(request, song_id):
    song = get_object_or_404(Song, id=song_id)
    FavoriteSong.objects.filter(user=request.user, song=song).delete()
    favorites = FavoriteSong.objects.filter(user=request.user).select_related("song")
    return render(request, "music/favorites.html", {"favorites": favorites})
@login_required
def remove_favorite_home(request, song_id):
    song = get_object_or_404(Song, id=song_id)
    FavoriteSong.objects.filter(user=request.user, song=song).delete()
    return redirect('home')

@staff_member_required
def upload_song(request):
    if request.method == 'POST':
        form = SongUploadForm(request.POST, request.FILES)
        if form.is_valid():
            song = form.save(commit=False)
            song.save()
            return redirect('home')
    else:
        form = SongUploadForm()
    return render(request, 'music/upload_song.html', {'form': form})

@login_required
@require_POST
def rate_song(request, song_id):
    song = get_object_or_404(Song, id=song_id)
    try:
        data = json.loads(request.body)
        rating_value = int(data.get('rating', 0))
        if 1 <= rating_value <= 5:
            Rating.objects.update_or_create(
                user=request.user,
                song=song,
                defaults={'rating': rating_value}
            )
            # Tính lại số sao trung bình sau khi đánh giá
            new_average = Rating.objects.filter(song=song).aggregate(avg=Avg('rating'))['avg']
            return JsonResponse({'success': True, 'message': 'Đánh giá thành công!', 'new_average': new_average})
        else:
            return JsonResponse({'success': False, 'message': 'Đánh giá không hợp lệ!'})
    except (ValueError, KeyError, json.JSONDecodeError):
        return JsonResponse({'success': False, 'message': 'Dữ liệu không hợp lệ!'})