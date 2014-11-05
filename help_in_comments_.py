import random

ss = 'simple_ -str:.ing'
dd = ss.translate(None, '-: .')
print dd
'simple_string'

dd = random.sample('qwerty', 6)
print(''.join(dd))
'yqertw'


# def my_view(request):
#     return HttpResponse("Hello!")
#
#
# def get_admin_urls(urls):
#     def get_urls():
#         my_urls = patterns('',
#             (r'^my_view/$', admin.site.admin_view(my_view))
#         )
#         return my_urls + urls
#     return get_urls
#
# admin_urls = get_admin_urls(admin.site.get_urls())
# admin.site.get_urls = admin_urls