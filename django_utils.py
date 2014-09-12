from urlparse import urlparse
from django.http import HttpResponseRedirect


def get_from_choices(choices, f_name):
    return [i for i in choices if i[1] == 'xuxa'][0][0]



# def redirect_for_login(request):
#     referer = request.META.get('HTTP_REFERER', None)
#     to = '/'
#     if referer:
#         parsed_uri = urlparse(referer)
#         referer_host = '{uri.netloc}'.format(uri=parsed_uri)
#         if referer_host == request.META.get('HTTP_HOST', None):
#             to = referer
#
#     return HttpResponseRedirect(to + '?next=' + request.path_info)