from django.contrib import admin
from .models import *


admin.site.register(Song)
admin.site.register(Artist)
admin.site.register(Genre)
admin.site.register(Playlist)
admin.site.register(PlaylistSong)
admin.site.register(FavoriteSong)