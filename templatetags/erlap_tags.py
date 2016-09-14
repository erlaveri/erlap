from django.template import Node
from django import template
import re

try:
    import ipdb as pdb
except ImportError:
    import pdb

register = template.Library()


class PdbNode(Node):
    def render(self, context):
        pdb.set_trace()
        return ''


@register.tag
def pdb_debug(parser, token):
    return PdbNode()


@register.simple_tag
def active(request, pattern):
    if request.path.startswith(pattern):
        return 'active'
    return ''


@register.inclusion_tag('erlap/pagination.html', takes_context=True)
def erl_pagination(context, page):
    paginator = page.paginator
    all_pages = paginator.num_pages
    cur = page.number
    pages = [1, ]

    if all_pages > 1:
        if cur - 1 > 3:
            pages.append(None)
            pages += range(cur - 2, cur + 1)

        else:
            pages += range(2, cur + 1)
        # ###########################################
        if all_pages - cur > 3:
            pages += range(cur + 1, cur + 3)
            pages.append(None)
            pages.append(all_pages)
        else:
            pages += range(cur + 1, all_pages + 1)

    req = context['request']
    query_vars = re.sub(r'page=\d+&?', '', req.GET.urlencode())
    query_vars = '&' + query_vars if query_vars else query_vars
    context['query_vars'] = query_vars

    return {'pages': pages, 'query_vars': query_vars, 'cur': cur}


@register.assignment_tag(takes_context=True)
def au_pagination(context):
    page_obj = context.get('page_obj')
    if page_obj:
        paginator = page_obj.paginator
        all_pages = paginator.num_pages
        cur = page_obj.number
        pages = [1, ]

        if all_pages > 1:
            if cur - 1 > 3:
                pages.append(None)
                pages += range(cur - 2, cur + 1)

            else:
                pages += range(2, cur + 1)
            # ###########################################
            if all_pages - cur > 3:
                pages += range(cur + 1, cur + 3)
                pages.append(None)
                pages.append(all_pages)
            else:
                pages += range(cur + 1, all_pages + 1)

        req = context['request']

        query_vars = req.GET.copy()
        if 'page' in query_vars:
            query_vars.pop('page')
        query_vars = query_vars.urlencode()

        query_vars = '&' + query_vars if query_vars else query_vars
        context.update({'au_p_pages': pages, 'au_p_query_vars': query_vars, 'au_p_cur': cur})

    return context