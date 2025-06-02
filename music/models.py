from django.db import models
from django.contrib.auth.models import User

class Artist(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='artist/', default='default.jpg')
    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.ManyToManyField(Artist, related_name='songs')
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
    audio = models.FileField(upload_to='songs/')
    image = models.ImageField(upload_to='covers/', default='default.jpg')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Playlist(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"

class PlaylistSong(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

class FavoriteSong(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_songs')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'song')  # Không cho phép người dùng thêm trùng bài
    def __str__(self):
        return f"{self.user.username} - {self.song.title}"

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 đến 5 sao
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'song')  # Một người dùng chỉ được đánh giá một bài hát một lần

    def __str__(self):
        return f"{self.user.username} - {self.song.title} - {self.rating} sao"