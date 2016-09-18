import json
from pprint import pprint
import pdb

PARTIES = [ "CON", "LAB", "UKIP", "LD", "SNP", "GRN", "DUP", "PC", "SF", "UUP", "IND", "SDLP", "APNI", "TUSC", "SPE", "NHA", "TUV", "RES", "CSA", "Others" ]

with open('data.json') as json_file:
  json_data = json.load(json_file)
#  print(json_data)

output = {}
output['name'] = 'election data'
output['children'] = []
for constituency in json_data:
  consthash = {}
  consthash['name'] = constituency['Constituency']
  consthash['shareign'] = constituency['Share ignored']
  consthash['size'] = 1
  consthash['children'] = []
  for party in PARTIES:
    if constituency[party] and constituency[party] > 0:
      win = 0
      # XXX: Here change condition
      if constituency['Result'].find(party, 0, 5) > -1:
        win = 1
      consthash['children'].append({'name': party, 'size': constituency[party], 'win': win})
  output['children'].append(consthash)
      
print json.dumps(output, sort_keys=True, indent=4, separators=(',', ': '))
