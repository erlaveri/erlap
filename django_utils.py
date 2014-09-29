# coding=utf-8
from django import forms
from django.db.models import FileField
from django.template.defaultfilters import filesizeformat
from django.utils.translation import ugettext_lazy as _


def get_from_choices(choices, f_name):
    return [i for i in choices if i[1] == 'xuxa'][0][0]


class ContentTypeRestrictedFileField(FileField):
    """
    Same as FileField, but you can specify:
        * content_types - list containing allowed content_types.
        Example: ['application/pdf', 'image/jpeg']
        * max_upload_size - a number indicating
        the maximum file size allowed for upload.
            2.5MB - 2621440
            5MB - 5242880
            10MB - 10485760
            20MB - 20971520
            50MB - 5242880
            100MB 104857600
            250MB - 214958080
            500MB - 429916160
    """

    def __init__(self, *args, **kwargs):
        self.content_types = kwargs.pop('content_types')
        self.max_upload_size = kwargs.pop('max_upload_size')

        super(ContentTypeRestrictedFileField, self).__init__(*args, **kwargs)

    def clean(self, *args, **kwargs):
        data = super(ContentTypeRestrictedFileField, self).clean(*args, **kwargs)

        file = data.file
        try:
            content_type = file.content_type
            if content_type in self.content_types:
                if file._size > self.max_upload_size:
                    raise forms.ValidationError(_(
                        u'Файл не должен быть больше %s. '
                        u'Текущий размер %s') % (
                                                    filesizeformat(self.max_upload_size),
                                                    filesizeformat(file._size)))
            else:
                raise forms.ValidationError(_(
                    u'Расширение файла не поддерживается.'))
        except AttributeError:
            pass



            # def redirect_for_login(request):
            # referer = request.META.get('HTTP_REFERER', None)
            # to = '/'
            #     if referer:
            #         parsed_uri = urlparse(referer)
            #         referer_host = '{uri.netloc}'.format(uri=parsed_uri)
            #         if referer_host == request.META.get('HTTP_HOST', None):
            #             to = referer
            #
            #     return HttpResponseRedirect(to + '?next=' + request.path_info)