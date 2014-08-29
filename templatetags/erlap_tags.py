from django.template import Node
from django import template

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


@register.filter
def js_errors(value, arg):
    return value.field.error_messages