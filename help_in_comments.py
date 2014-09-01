import random

ss = 'simple_ -str:.ing'
dd = ss.translate(None, '-: .')
print dd
'simple_string'

dd = random.sample('qwerty', 6)
print(''.join(dd))
'yqertw'
