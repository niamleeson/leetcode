export const bitlyDiagrams = [
  {
    "id": "requirements",
    "section": "Non-functional Requirements",
    "caption": "Functional and non-functional requirements",
    "filename": "requirements.svg",
    "width": 805.2764282226562,
    "height": 140,
    "revision": "ae188638fd1e"
  },
  {
    "id": "entities",
    "section": "Core Entities",
    "caption": "Core entities",
    "filename": "entities.svg",
    "width": 123.58393859863281,
    "height": 100,
    "revision": "303fdebe2848"
  },
  {
    "id": "create-url",
    "section": "1) Create a short URL",
    "caption": "Creating and storing a short URL",
    "filename": "create-url.svg",
    "width": 1135.7323913574219,
    "height": 193.33302491306563,
    "revision": "9175cdd62eb1"
  },
  {
    "id": "redirect",
    "section": "2) Redirect to the original URL",
    "caption": "Looking up a short code and returning a redirect",
    "filename": "redirect.svg",
    "width": 1135.7323913574219,
    "height": 249.80597462271817,
    "revision": "73e4f8f3ccd9"
  },
  {
    "id": "hash",
    "section": "1) Generate unique short codes",
    "caption": "Generating a short code with a hash function",
    "filename": "hash.svg",
    "width": 1135.7323913574219,
    "height": 272.82355116461395,
    "revision": "6926f7f2117e"
  },
  {
    "id": "counter",
    "section": "1) Generate unique short codes",
    "caption": "Generating a short code with a unique counter",
    "filename": "counter.svg",
    "width": 1135.7323913574219,
    "height": 272.82355116461395,
    "revision": "fb8f3aeee074"
  },
  {
    "id": "cache",
    "section": "2) Make redirects fast",
    "caption": "Checking the cache before the database",
    "filename": "cache.svg",
    "width": 1135.7323913574219,
    "height": 407.58914094926877,
    "revision": "315e0f1e6b3c"
  },
  {
    "id": "final-design",
    "section": "Final Design",
    "caption": "Final design with separate read and write services",
    "filename": "final-design.svg",
    "width": 1325.8588815932217,
    "height": 679.4597989140411,
    "revision": "0c35ca9d94ff"
  }
] as const;
