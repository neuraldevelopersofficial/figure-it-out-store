const { v4: uuidv4 } = require('uuid');
const { getDatabase, getCollection, COLLECTIONS } = require('../config/database');

// Updated products with Cloudinary URLs (2025-10-11T03:06:56.435Z)
// This file now serves as a compatibility layer for MongoDB
// All operations will be performed on the database when available
// Empty array as fallback only if database is not available
let products = [
  {
    "id": "1760152016432-0-42376jnnk",
    "name": "Eren Yeager[ Titan from action figure]",
    "price": 599,
    "original_price": 599,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147848/figure-it-out-store/products/s3znp4y6qrtfoyldo95e.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147848/figure-it-out-store/products/s3znp4y6qrtfoyldo95e.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147887/figure-it-out-store/products/v29njchgufau68f865du.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147906/figure-it-out-store/products/nlz2lcgloiaier8a3x1s.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.511507450809723,
    "reviews": 229,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "A visceral portrayal of Eren's Attack Titan form, this figure captures his transformation during the Shiganshina arc. With sinewy sculpting and a fierce gaze, it anchors any Attack on Titan evolution display.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 85,
    "created_at": "2025-10-11T03:06:56.433Z",
    "updated_at": "2025-10-11T03:06:56.433Z"
  },
  {
    "id": "1760152016433-1-3870qj5sc",
    "name": "Jujutsu kaisen gojo saturo sitting action figure",
    "price": 749,
    "original_price": 749,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147919/figure-it-out-store/products/mueslad4k5jlgxoq7wml.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147919/figure-it-out-store/products/mueslad4k5jlgxoq7wml.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.86604930305315,
    "reviews": 162,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Capture the calm yet overwhelming aura of Gojo Satoru with this Jujutsu kaisen gojo saturo sitting action figure, a must-have for every Jujutsu Kaisen fan.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 95,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-2-a2oyxmyp3",
    "name": "Goku black super saiyan rose",
    "price": 749,
    "original_price": 749,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147930/figure-it-out-store/products/ayy1p5zns0uhsumgayfq.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147930/figure-it-out-store/products/ayy1p5zns0uhsumgayfq.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147940/figure-it-out-store/products/kp0wia6ajozmdvhcyvxp.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147951/figure-it-out-store/products/szxzpkseafyuueeglirc.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.661757472755202,
    "reviews": 176,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Radiating divine malice, this Goku Black figure in Super Saiyan Rose form features translucent pink hair and a sinister aura. A must-have for Dragon Ball Super villain showcases.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 98,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-3-2edpve0rp",
    "name": "Yoriichi Tsugikuni",
    "price": 1499,
    "original_price": 1499,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147959/figure-it-out-store/products/m8f5dxvlxyy03uscml7z.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147959/figure-it-out-store/products/m8f5dxvlxyy03uscml7z.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147965/figure-it-out-store/products/ohwihg45y03udwh4huyc.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147971/figure-it-out-store/products/vuzcayktdvhjjltjopz8.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147978/figure-it-out-store/products/yn0md8aazrspyq3nylqr.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.606225532598203,
    "reviews": 191,
    "is_new": false,
    "is_on_sale": true,
    "discount": 24,
    "description": "A striking tribute to the legendary Demon Slayer Yoriichi Tsugikuni, showcasing his unmatched strength and grace.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 92,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-4-sbo0yxggw",
    "name": "Insosuke Hashibira",
    "price": 1499,
    "original_price": 1499,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147986/figure-it-out-store/products/glvviumajvcx06asaect.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147986/figure-it-out-store/products/glvviumajvcx06asaect.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147993/figure-it-out-store/products/qwnn3txlfbslplelpdq9.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760147999/figure-it-out-store/products/gmzfcaoarvat4g9tykct.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148006/figure-it-out-store/products/z6k37tz1tlfyccko2hr3.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.576611195883168,
    "reviews": 202,
    "is_new": false,
    "is_on_sale": false,
    "discount": 24,
    "description": "Celebrate the wild and fearless spirit of Inosuke with this Insosuke Hashibira, crafted with lifelike details and energy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 84,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-5-kmdo13x3l",
    "name": "Demon Hashira Tengen Uzui",
    "price": 1499,
    "original_price": 1499,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148014/figure-it-out-store/products/fvebimrzh557ljpm2lju.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148014/figure-it-out-store/products/fvebimrzh557ljpm2lju.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148021/figure-it-out-store/products/thax40hkaxaropnnmfr2.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148027/figure-it-out-store/products/kzud8xknurat3ikzz63b.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148033/figure-it-out-store/products/l3nf9phccpglfnfij4fy.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.99924724493194,
    "reviews": 236,
    "is_new": false,
    "is_on_sale": true,
    "discount": 30,
    "description": "An exquisitely crafted Demon Hashira Tengen Uzui, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 98,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-6-ldl5w21gy",
    "name": "Madara Uchiha White Ten-Tails Jinchuriki ",
    "price": 1599,
    "original_price": 1599,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148043/figure-it-out-store/products/cd2qfenpwradirg2oq8h.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148043/figure-it-out-store/products/cd2qfenpwradirg2oq8h.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148051/figure-it-out-store/products/d4dsobbc30vegswbqyig.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148057/figure-it-out-store/products/gyd2dgcn4a9htlpkgo5e.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148065/figure-it-out-store/products/t0bjos10x62batvsjeic.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.630928285899786,
    "reviews": 223,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Madara Uchiha White Ten-Tails Jinchuriki , designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 96,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-7-orqj7dfkg",
    "name": "Super Saiyan Blue Evolved Vegeta",
    "price": 1699,
    "original_price": 1699,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148072/figure-it-out-store/products/noiqi2wzze9zr5yz8gg0.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148072/figure-it-out-store/products/noiqi2wzze9zr5yz8gg0.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148078/figure-it-out-store/products/ozdzuzyam2lgm4ic8l01.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148087/figure-it-out-store/products/jb8svnlclwahfrrxej1v.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.508263262810391,
    "reviews": 238,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Super Saiyan Blue Evolved Vegeta, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 97,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-8-qjqzr8wch",
    "name": "Demon Muzan Kibutsuji ",
    "price": 1599,
    "original_price": 1599,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148096/figure-it-out-store/products/abiqp6kbuact3wyhcl12.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148096/figure-it-out-store/products/abiqp6kbuact3wyhcl12.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148103/figure-it-out-store/products/atiiw5oqvrvvwrciyknh.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148109/figure-it-out-store/products/gr5byiycmn9igiyybnut.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148115/figure-it-out-store/products/wa1bosj0umqoqno3lmvx.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148122/figure-it-out-store/products/bbsrenhokajtpluseep2.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.74220367187006,
    "reviews": 94,
    "is_new": true,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Demon Muzan Kibutsuji , designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 94,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-9-z2mi9or5j",
    "name": "Roronoa Zoro 30CM",
    "price": 2849,
    "original_price": 2849,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148133/figure-it-out-store/products/hw5arjj6d7hp3a4et0bu.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148133/figure-it-out-store/products/hw5arjj6d7hp3a4et0bu.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148143/figure-it-out-store/products/phirk7c3o9axlazt7bfw.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148155/figure-it-out-store/products/pllhdnvn3hi1zvu5wblv.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148164/figure-it-out-store/products/i34kgnfghwthjyn1ozgu.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148173/figure-it-out-store/products/ihvnvx6qsxbo9hmlhi0x.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148183/figure-it-out-store/products/cphrz6c8w4v60rkunfhq.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.841558110709908,
    "reviews": 170,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "Channel the three-sword style with this Roronoa Zoro 30CM, a perfect figure for One Piece collectors.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 88,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-10-2l4stljy2",
    "name": "Shinoba Kocho",
    "price": 1499,
    "original_price": 1499,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148191/figure-it-out-store/products/fp4h9xpedepsswovah1n.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148191/figure-it-out-store/products/fp4h9xpedepsswovah1n.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148198/figure-it-out-store/products/tqlc1kcs3nlairpleybg.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148204/figure-it-out-store/products/ivhjoe6c9wd2tjflkjc8.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.897077841843225,
    "reviews": 132,
    "is_new": false,
    "is_on_sale": false,
    "discount": 34,
    "description": "An exquisitely crafted Shinoba Kocho, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 89,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-11-n6lgwi9gw",
    "name": "Bobblehead Figurine ",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148217/figure-it-out-store/products/ykee7bvl1kq4y3jxmg3g.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148217/figure-it-out-store/products/ykee7bvl1kq4y3jxmg3g.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.603107175080738,
    "reviews": 208,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Bobblehead Figurine , designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 99,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-12-nqo7zvo1z",
    "name": "Itachi Uchiha Premium Action Figure With Two Heads",
    "price": 1699,
    "original_price": 1699,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148234/figure-it-out-store/products/o8k0ba95v86xz38jmvel.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148234/figure-it-out-store/products/o8k0ba95v86xz38jmvel.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148253/figure-it-out-store/products/aryschwt98rkjufzecop.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148272/figure-it-out-store/products/o6lgcgkcbdmj7cjfixz5.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148283/figure-it-out-store/products/tcyayf7z3ijdjcku58y8.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.68468976278593,
    "reviews": 107,
    "is_new": true,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Itachi Uchiha Premium Action Figure With Two Heads, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 59,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-13-3tir58ycr",
    "name": "Naruto Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148302/figure-it-out-store/products/tgkimlbnobjxqjkmdnza.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148302/figure-it-out-store/products/tgkimlbnobjxqjkmdnza.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.722935876178398,
    "reviews": 56,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "Step into the world of ninjas with this Naruto Bobblehead, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 58,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-14-9e3vvl19b",
    "name": "Monkey D Luffy Gear 5 Sun God Nika LED Action Figure",
    "price": 1549,
    "original_price": 1549,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148318/figure-it-out-store/products/vuy9zl6fbfkb5p0n3clw.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148318/figure-it-out-store/products/vuy9zl6fbfkb5p0n3clw.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148332/figure-it-out-store/products/my9we2yogr6vyt5dzyrr.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148340/figure-it-out-store/products/jajnoimskm96qobuge43.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148353/figure-it-out-store/products/twcwxj7eyvk0c6x3epbx.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148363/figure-it-out-store/products/ahy9otxl2okhj4lhehxo.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.962399216030957,
    "reviews": 133,
    "is_new": true,
    "is_on_sale": false,
    "discount": 0,
    "description": "Sail into adventure with this Monkey D Luffy Gear 5 Sun God Nika LED Action Figure, capturing the joyful yet determined spirit of Monkey D. Luffy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 97,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-15-0lhym53if",
    "name": "Roronoa Zoro Ittoryu Haoshoku",
    "price": 1199,
    "original_price": 1199,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148371/figure-it-out-store/products/azl85noonlmvcoi2jdkc.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148371/figure-it-out-store/products/azl85noonlmvcoi2jdkc.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148379/figure-it-out-store/products/ogwmqnwaiptnav9ec6xu.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148387/figure-it-out-store/products/hgpdogy3psvizzqmlogc.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148394/figure-it-out-store/products/iw4gbxfinuqgcz851z7m.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.881232512606207,
    "reviews": 192,
    "is_new": false,
    "is_on_sale": false,
    "discount": 35,
    "description": "Channel the three-sword style with this Roronoa Zoro Ittoryu Haoshoku, a perfect figure for One Piece collectors.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 53,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-16-9khaufxno",
    "name": "Monkey D Luffy Gear 4 Red Hawk Action",
    "price": 1699,
    "original_price": 1699,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148408/figure-it-out-store/products/kqy6f8hiy506nzwcahtq.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148408/figure-it-out-store/products/kqy6f8hiy506nzwcahtq.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148425/figure-it-out-store/products/vhgp3axmleunbqhyp7gt.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148444/figure-it-out-store/products/rnuqttwl40xnplyiy0v1.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148461/figure-it-out-store/products/d0dlpbuyhy444asq1inq.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148478/figure-it-out-store/products/rcwodeggsywd9vzhdl3h.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148495/figure-it-out-store/products/smls9xup71phac1iuayg.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148519/figure-it-out-store/products/jmf9hnuh86ucbjjyafo4.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148543/figure-it-out-store/products/vatwvf9mfwmgomexbexr.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.610934640797758,
    "reviews": 234,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Sail into adventure with this Monkey D Luffy Gear 4 Red Hawk Action, capturing the joyful yet determined spirit of Monkey D. Luffy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 93,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-17-eikpzde0g",
    "name": "Kokushibo ",
    "price": 2849,
    "original_price": 2849,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148565/figure-it-out-store/products/j2b0xs4jqfvuhenuvpvu.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148565/figure-it-out-store/products/j2b0xs4jqfvuhenuvpvu.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148586/figure-it-out-store/products/nvd7sft9pmkbeotstunj.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148609/figure-it-out-store/products/odnbblizqnbarrsc5ckv.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148626/figure-it-out-store/products/fqjmb5kdaty8di7lthsr.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148645/figure-it-out-store/products/kh2omhvsdg1oansquhsx.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148670/figure-it-out-store/products/k6hlbxyyne7jyms6j3j0.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148697/figure-it-out-store/products/hlq6ruhmfueiedrkdjji.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.764030650120755,
    "reviews": 229,
    "is_new": false,
    "is_on_sale": false,
    "discount": 16,
    "description": "An exquisitely crafted Kokushibo , designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 79,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-18-bbqnebz1y",
    "name": "Dead Pool Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148724/figure-it-out-store/products/uodezvc5j3qrywfswqnz.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148724/figure-it-out-store/products/uodezvc5j3qrywfswqnz.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.6465893122618676,
    "reviews": 209,
    "is_new": true,
    "is_on_sale": false,
    "discount": 23,
    "description": "An exquisitely crafted Dead Pool Bobblehead, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 87,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-19-flyot72se",
    "name": "Tanjiro Kamodo [Bubble Head Figure}",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148747/figure-it-out-store/products/onxxb9hcgf5hzo6mqmf9.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148747/figure-it-out-store/products/onxxb9hcgf5hzo6mqmf9.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.669713555786225,
    "reviews": 160,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "Honor the determination of Tanjiro Kamado with this Tanjiro Kamodo [Bubble Head Figure}, detailed to bring Demon Slayer’s hero to life.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 59,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-20-9ohkh1yod",
    "name": "Batman Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148765/figure-it-out-store/products/o1qt99gmd8egodpvfaar.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148765/figure-it-out-store/products/o1qt99gmd8egodpvfaar.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.776592248805164,
    "reviews": 69,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Batman Bobblehead, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 66,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-21-c4l0d90dk",
    "name": "Harry Potter Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148783/figure-it-out-store/products/dlxybnryqaiutueqg1ny.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148783/figure-it-out-store/products/dlxybnryqaiutueqg1ny.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.615096583685638,
    "reviews": 111,
    "is_new": true,
    "is_on_sale": false,
    "discount": 12,
    "description": "An exquisitely crafted Harry Potter Bobblehead, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 53,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-22-suu52aut2",
    "name": "Rorona Zoro Bubblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148800/figure-it-out-store/products/cjvhboppdxj4dlfhqv3e.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148800/figure-it-out-store/products/cjvhboppdxj4dlfhqv3e.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.812466762282603,
    "reviews": 148,
    "is_new": false,
    "is_on_sale": true,
    "discount": 33,
    "description": "Channel the three-sword style with this Rorona Zoro Bubblehead, a perfect figure for One Piece collectors.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 82,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-23-u28nherb5",
    "name": "Satoru Gojo Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148816/figure-it-out-store/products/ov1ohgcndehhuotqlw24.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148816/figure-it-out-store/products/ov1ohgcndehhuotqlw24.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.981632859559122,
    "reviews": 118,
    "is_new": true,
    "is_on_sale": false,
    "discount": 33,
    "description": "Capture the calm yet overwhelming aura of Gojo Satoru with this Satoru Gojo Bobblehead, a must-have for every Jujutsu Kaisen fan.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 66,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-24-1xum0t0zx",
    "name": "Kakashi Hatake Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148831/figure-it-out-store/products/lhjovuecfufpyl2lld5u.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148831/figure-it-out-store/products/lhjovuecfufpyl2lld5u.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.655182246214289,
    "reviews": 211,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Kakashi Hatake Bobblehead, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 50,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-25-1s5d97er0",
    "name": "Satoru Gojo Sitting Version Figure",
    "price": 749,
    "original_price": 749,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148841/figure-it-out-store/products/ahf4713wlvmybsybyz3z.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148841/figure-it-out-store/products/ahf4713wlvmybsybyz3z.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.80706105024838,
    "reviews": 234,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Capture the calm yet overwhelming aura of Gojo Satoru with this Satoru Gojo Sitting Version Figure, a must-have for every Jujutsu Kaisen fan.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 92,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-26-sk8f1lxza",
    "name": "Iron Man Bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148852/figure-it-out-store/products/bme1x1bbtkbo47njgyvk.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148852/figure-it-out-store/products/bme1x1bbtkbo47njgyvk.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.748149420273569,
    "reviews": 207,
    "is_new": true,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Iron Man Bobblehead, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 97,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-27-43ibx8ufp",
    "name": "Joker Bobblehead Figure",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148866/figure-it-out-store/products/v0zvu9jpgvuikfvo7qzh.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148866/figure-it-out-store/products/v0zvu9jpgvuikfvo7qzh.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148879/figure-it-out-store/products/tjim56ndvqtu3nxud1qi.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.70692038230493,
    "reviews": 213,
    "is_new": true,
    "is_on_sale": true,
    "discount": 12,
    "description": "An exquisitely crafted Joker Bobblehead Figure, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 96,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-28-j1atm89dz",
    "name": "Kakashi Hatake",
    "price": 699,
    "original_price": 699,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148896/figure-it-out-store/products/uypu50opvl0vsptmljfj.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148896/figure-it-out-store/products/uypu50opvl0vsptmljfj.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148912/figure-it-out-store/products/y9tlvrgu95knbfolz6uf.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148927/figure-it-out-store/products/gkwerrt5tu9vizkvbrsp.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.995966767554972,
    "reviews": 109,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Kakashi Hatake, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 87,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-29-jezx0ay7s",
    "name": "Q Posket Figure[Inosuke Hashibira]",
    "price": 379,
    "original_price": 379,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148941/figure-it-out-store/products/ltzj057b8jkgwbgp6azp.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148941/figure-it-out-store/products/ltzj057b8jkgwbgp6azp.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148951/figure-it-out-store/products/bo5zbjnflb1iqyxzfztn.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148962/figure-it-out-store/products/uy0v0aoym0asgni04su0.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.569199288706621,
    "reviews": 189,
    "is_new": false,
    "is_on_sale": true,
    "discount": 34,
    "description": "Celebrate the wild and fearless spirit of Inosuke with this Q Posket Figure[Inosuke Hashibira], crafted with lifelike details and energy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 89,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-30-v79xh80in",
    "name": "Q Posket Style Deadpool Action Figure",
    "price": 379,
    "original_price": 379,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148974/figure-it-out-store/products/vxsnxm8yvkckr4a601fm.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148974/figure-it-out-store/products/vxsnxm8yvkckr4a601fm.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.9611115450557275,
    "reviews": 212,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Q Posket Style Deadpool Action Figure, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 60,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-31-xvri3v0uh",
    "name": "Harry Potter Q Posket",
    "price": 379,
    "original_price": 379,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148986/figure-it-out-store/products/apxryuu99bgpswxzl2qe.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148986/figure-it-out-store/products/apxryuu99bgpswxzl2qe.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.9856920980468935,
    "reviews": 217,
    "is_new": false,
    "is_on_sale": true,
    "discount": 28,
    "description": "An exquisitely crafted Harry Potter Q Posket, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 61,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-32-1392wljqq",
    "name": "Naruto Uzumaki",
    "price": 849,
    "original_price": 849,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148997/figure-it-out-store/products/lctrcdxmcnxjltqwtw2c.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760148997/figure-it-out-store/products/lctrcdxmcnxjltqwtw2c.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149007/figure-it-out-store/products/gg8tfrmq33iirbttrkbs.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.929081134781517,
    "reviews": 130,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Step into the world of ninjas with this Naruto Uzumaki, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 73,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-33-f193mnp7g",
    "name": "S.H Figuarts Goku Black Super Rose ",
    "price": 749,
    "original_price": 749,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149017/figure-it-out-store/products/srosgsn0cl33vmauoyly.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149017/figure-it-out-store/products/srosgsn0cl33vmauoyly.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149027/figure-it-out-store/products/tyh4zeoveyc1iv0un7hl.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.992032283454667,
    "reviews": 135,
    "is_new": true,
    "is_on_sale": false,
    "discount": 25,
    "description": "Bring home the legendary Saiyan with this S.H Figuarts Goku Black Super Rose , capturing his raw power and fierce presence in every detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 65,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-34-3ph62iycy",
    "name": "Might Guy ",
    "price": 1899,
    "original_price": 1899,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149038/figure-it-out-store/products/us530h5jctlt7fmcxc5r.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149038/figure-it-out-store/products/us530h5jctlt7fmcxc5r.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149048/figure-it-out-store/products/tjq65vwzklktcwoqyq9k.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149059/figure-it-out-store/products/u2vforrcsrvangf8kfoh.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.639880721079776,
    "reviews": 237,
    "is_new": true,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Might Guy , designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 82,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-35-ubufta7v8",
    "name": "Tanjiro Kamodo",
    "price": 949,
    "original_price": 949,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149070/figure-it-out-store/products/vuvual9fvlvf0xfd6abg.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149070/figure-it-out-store/products/vuvual9fvlvf0xfd6abg.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149080/figure-it-out-store/products/gakusy6dpuddmfzwycl0.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149096/figure-it-out-store/products/rxflcbp6s3fqdqu0dnag.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149110/figure-it-out-store/products/mozjdyvcfl4oubulaep2.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149120/figure-it-out-store/products/vt7gyk75yhc5gj3qqbsp.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.519744424322479,
    "reviews": 249,
    "is_new": true,
    "is_on_sale": true,
    "discount": 17,
    "description": "Honor the determination of Tanjiro Kamado with this Tanjiro Kamodo, detailed to bring Demon Slayer’s hero to life.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 83,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-36-za99e06rp",
    "name": "Gyotaro [ Kmitsu No Yaiba]",
    "price": 1749,
    "original_price": 1749,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149129/figure-it-out-store/products/jposxwft3cfccoawsghq.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149129/figure-it-out-store/products/jposxwft3cfccoawsghq.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149138/figure-it-out-store/products/ifkkr2qgiainjbc9znzg.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149147/figure-it-out-store/products/kshvgcxsviktfk7apxrj.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149158/figure-it-out-store/products/hk9tdslmtkysgu0fdrvx.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149168/figure-it-out-store/products/frryahryv7uvtcs2cnsu.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.914875239730692,
    "reviews": 232,
    "is_new": true,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Gyotaro [ Kmitsu No Yaiba], designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 59,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-37-fd6kmgfao",
    "name": "Paper weight",
    "price": 699,
    "original_price": 699,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149173/figure-it-out-store/products/uhu1r9stkgnj2axef1n7.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149173/figure-it-out-store/products/uhu1r9stkgnj2axef1n7.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149176/figure-it-out-store/products/mvfv4log87ama7mycewu.jpg",
      "https://res.cloudinary.com/dpeun5lss/video/upload/v1760149182/figure-it-out-store/products/lgoiwi5wsagxssiyef8p.mp4"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.582231847546292,
    "reviews": 220,
    "is_new": true,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Paper weight, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 76,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-38-6snjt27ij",
    "name": "Monkey D Luffy Gear 5 Sitting Nika Action Figure",
    "price": 1199,
    "original_price": 1199,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149195/figure-it-out-store/products/afvcclwhf6crzozvukcv.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149195/figure-it-out-store/products/afvcclwhf6crzozvukcv.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149206/figure-it-out-store/products/wirp2bizpe6eu3vtkwlc.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149215/figure-it-out-store/products/ym8l46ak6urjog9exznp.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.787821301767382,
    "reviews": 219,
    "is_new": true,
    "is_on_sale": false,
    "discount": 27,
    "description": "Sail into adventure with this Monkey D Luffy Gear 5 Sitting Nika Action Figure, capturing the joyful yet determined spirit of Monkey D. Luffy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 88,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-39-fy7rkt3ec",
    "name": "Zoro Action Figure 9 Sword Style Zoro ",
    "price": 1249,
    "original_price": 1249,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149220/figure-it-out-store/products/b5abfyyjomvr9rxhoczu.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149220/figure-it-out-store/products/b5abfyyjomvr9rxhoczu.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149223/figure-it-out-store/products/nnspk1gq7q3mdyultkfr.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149227/figure-it-out-store/products/lghkwlcr4tzvkbynvetp.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.8099160289661675,
    "reviews": 121,
    "is_new": false,
    "is_on_sale": false,
    "discount": 33,
    "description": "Channel the three-sword style with this Zoro Action Figure 9 Sword Style Zoro , a perfect figure for One Piece collectors.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 99,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-40-yau7cndpz",
    "name": "Zoro-1",
    "price": 1049,
    "original_price": 1049,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149238/figure-it-out-store/products/fihyp1mq1atx2futqlku.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149238/figure-it-out-store/products/fihyp1mq1atx2futqlku.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149247/figure-it-out-store/products/wzwwtl4ty2kg77qs2gvz.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149258/figure-it-out-store/products/uc71tovc2hbnr474vt81.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149266/figure-it-out-store/products/iomexxwmjie0fjdqthib.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.690907742695237,
    "reviews": 168,
    "is_new": true,
    "is_on_sale": true,
    "discount": 0,
    "description": "Channel the three-sword style with this Zoro-1, a perfect figure for One Piece collectors.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 94,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-41-m8keaxlqx",
    "name": "Gyutaro Action Figure",
    "price": 1549,
    "original_price": 1549,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149278/figure-it-out-store/products/mmhkkckn9qmpfehzt1ix.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149278/figure-it-out-store/products/mmhkkckn9qmpfehzt1ix.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149289/figure-it-out-store/products/ubpyaam5qylfr0oxudpw.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149298/figure-it-out-store/products/fmpkmln8toep99jtr0kp.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.947890556933026,
    "reviews": 167,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Gyutaro Action Figure, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 92,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-42-n4pr27onl",
    "name": "Naruto Uchiha With Crow Bust",
    "price": 799,
    "original_price": 799,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149309/figure-it-out-store/products/qnktdnl3vmacw0scyj7y.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149309/figure-it-out-store/products/qnktdnl3vmacw0scyj7y.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149321/figure-it-out-store/products/e6d9er5lyre3xxjygky7.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149331/figure-it-out-store/products/jzjnogv8kc4shqzvzcpq.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.597045022657023,
    "reviews": 189,
    "is_new": false,
    "is_on_sale": true,
    "discount": 20,
    "description": "Step into the world of ninjas with this Naruto Uchiha With Crow Bust, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 60,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-43-zlx4xmtdt",
    "name": "Itachi uchiha bobblehead",
    "price": 349,
    "original_price": 349,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149341/figure-it-out-store/products/iorhjiigmndhafo5vjxl.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149341/figure-it-out-store/products/iorhjiigmndhafo5vjxl.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.977294757182422,
    "reviews": 248,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Itachi uchiha bobblehead, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 60,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-44-xitukew2b",
    "name": "Zoro Standing",
    "price": 1499,
    "original_price": 1499,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149348/figure-it-out-store/products/t016kwsyery5szn3d47v.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149348/figure-it-out-store/products/t016kwsyery5szn3d47v.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149355/figure-it-out-store/products/da5rxocmvr7i4wmyfm0o.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149361/figure-it-out-store/products/khzxxbhgpuj0ubwzmw46.jpg"
    ],
    "category": "Anime Figures",
    "category_slug": "anime-figures",
    "rating": 4.72939906570978,
    "reviews": 99,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Channel the three-sword style with this Zoro Standing, a perfect figure for One Piece collectors.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 77,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-45-7atzzirnc",
    "name": "Mystic Mantle Joker GREEN Keychain / green metal colored keychain",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149366/figure-it-out-store/products/eckarpprbw5rz3csgvah.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149366/figure-it-out-store/products/eckarpprbw5rz3csgvah.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.938139341751526,
    "reviews": 125,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Mystic Mantle Joker GREEN Keychain / green metal colored keychain, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 83,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-46-f9xtzekp6",
    "name": "Naruto Shippuden-Llavero de metal Naruto Ramen",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149371/figure-it-out-store/products/efwrmrwzpqwajtyx8f01.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149371/figure-it-out-store/products/efwrmrwzpqwajtyx8f01.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.913514261593242,
    "reviews": 245,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Step into the world of ninjas with this Naruto Shippuden-Llavero de metal Naruto Ramen, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 63,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-47-1kopmaj92",
    "name": "Tanjiro Spinning Rotating Metal keychain",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/video/upload/v1760149377/figure-it-out-store/products/c7pvx1ejtl4gndfushh7.mp4",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/video/upload/v1760149377/figure-it-out-store/products/c7pvx1ejtl4gndfushh7.mp4"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.984568816640354,
    "reviews": 189,
    "is_new": false,
    "is_on_sale": false,
    "discount": 12,
    "description": "Honor the determination of Tanjiro Kamado with this Tanjiro Spinning Rotating Metal keychain, detailed to bring Demon Slayer’s hero to life.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 96,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016434-48-od7jww1bl",
    "name": "Inosuke Hashibira Rotating Metal keychain",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149383/figure-it-out-store/products/fsth8yqspfpakhu5eke5.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149383/figure-it-out-store/products/fsth8yqspfpakhu5eke5.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149387/figure-it-out-store/products/jodzdef53x3pjxiyyzlj.jpg",
      "https://res.cloudinary.com/dpeun5lss/video/upload/v1760149393/figure-it-out-store/products/vccetkojeinybdyllyts.mp4"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.58730980338444,
    "reviews": 188,
    "is_new": true,
    "is_on_sale": true,
    "discount": 26,
    "description": "Celebrate the wild and fearless spirit of Inosuke with this Inosuke Hashibira Rotating Metal keychain, crafted with lifelike details and energy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 84,
    "created_at": "2025-10-11T03:06:56.434Z",
    "updated_at": "2025-10-11T03:06:56.434Z"
  },
  {
    "id": "1760152016435-49-iy6h3y913",
    "name": "Naruto Rotating metal keychain",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149400/figure-it-out-store/products/tszs1nsq8tm1tucnzovv.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149400/figure-it-out-store/products/tszs1nsq8tm1tucnzovv.jpg",
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149405/figure-it-out-store/products/a9xeokbxlrscidhjddz4.jpg",
      "https://res.cloudinary.com/dpeun5lss/video/upload/v1760149410/figure-it-out-store/products/f7atahhumzzpvfjn9s2e.mp4"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.813179527877276,
    "reviews": 238,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "Step into the world of ninjas with this Naruto Rotating metal keychain, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 74,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-50-w7qz51gkj",
    "name": "Mik Naruto Anime Metal keychain",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149418/figure-it-out-store/products/yltdprtvxsofsg3fewmm.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149418/figure-it-out-store/products/yltdprtvxsofsg3fewmm.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.687615810057402,
    "reviews": 245,
    "is_new": true,
    "is_on_sale": false,
    "discount": 31,
    "description": "Step into the world of ninjas with this Mik Naruto Anime Metal keychain, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 64,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-51-risci1xty",
    "name": "Naruto uzumaki metal  keychain ",
    "price": 119,
    "original_price": 119,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149426/figure-it-out-store/products/kuykdlbqtm7cyeyd1a7y.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149426/figure-it-out-store/products/kuykdlbqtm7cyeyd1a7y.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.518982500008873,
    "reviews": 149,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Step into the world of ninjas with this Naruto uzumaki metal  keychain , embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 69,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-52-lnku2vvve",
    "name": "Gohan DragonBall Z 3D keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149434/figure-it-out-store/products/yzvi39a9cl7rnfygcs59.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149434/figure-it-out-store/products/yzvi39a9cl7rnfygcs59.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.716232274244372,
    "reviews": 79,
    "is_new": true,
    "is_on_sale": true,
    "discount": 0,
    "description": "An exquisitely crafted Gohan DragonBall Z 3D keychain, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 83,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-53-a670fezlt",
    "name": "Goku keychain Anime 3D keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149441/figure-it-out-store/products/hqctvyaru2g14c7ittff.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149441/figure-it-out-store/products/hqctvyaru2g14c7ittff.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.507274958799448,
    "reviews": 141,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "Bring home the legendary Saiyan with this Goku keychain Anime 3D keychain, capturing his raw power and fierce presence in every detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 91,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-54-7ojrtdgqi",
    "name": "Miles Morales Spider-Man keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149448/figure-it-out-store/products/zfqa4fmhctvalbkmgdu5.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149448/figure-it-out-store/products/zfqa4fmhctvalbkmgdu5.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.747702993190626,
    "reviews": 58,
    "is_new": false,
    "is_on_sale": false,
    "discount": 0,
    "description": "An exquisitely crafted Miles Morales Spider-Man keychain, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 88,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-55-eitrc9tjj",
    "name": "Satoru Gojo keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149454/figure-it-out-store/products/th5m5c1ctdujq6vydibu.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149454/figure-it-out-store/products/th5m5c1ctdujq6vydibu.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.939146533615254,
    "reviews": 86,
    "is_new": false,
    "is_on_sale": true,
    "discount": 0,
    "description": "Capture the calm yet overwhelming aura of Gojo Satoru with this Satoru Gojo keychain, a must-have for every Jujutsu Kaisen fan.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 63,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-56-isdvh5y11",
    "name": "Monkey D luffy 3D keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149461/figure-it-out-store/products/drfjqt9mac6kktjdf2bp.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149461/figure-it-out-store/products/drfjqt9mac6kktjdf2bp.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.921262805353277,
    "reviews": 73,
    "is_new": true,
    "is_on_sale": true,
    "discount": 0,
    "description": "Sail into adventure with this Monkey D luffy 3D keychain, capturing the joyful yet determined spirit of Monkey D. Luffy.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 67,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-57-abi4r5z62",
    "name": "Itachi uchiha  3D keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149467/figure-it-out-store/products/nxsivwg16klh0bdaxgb3.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149467/figure-it-out-store/products/nxsivwg16klh0bdaxgb3.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.521827048244544,
    "reviews": 113,
    "is_new": false,
    "is_on_sale": false,
    "discount": 11,
    "description": "An exquisitely crafted Itachi uchiha  3D keychain, designed for anime enthusiasts and collectors seeking authentic detail.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 95,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  },
  {
    "id": "1760152016435-58-pzzdfd06k",
    "name": "Naruto Sasuke Uchiha 3D keychain",
    "price": 99,
    "original_price": 99,
    "image": "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149473/figure-it-out-store/products/wkfpwszzblqvkirr4w3x.jpg",
    "images": [
      "https://res.cloudinary.com/dpeun5lss/image/upload/v1760149473/figure-it-out-store/products/wkfpwszzblqvkirr4w3x.jpg"
    ],
    "category": "Keychains",
    "category_slug": "keychains",
    "rating": 4.547202723594792,
    "reviews": 196,
    "is_new": true,
    "is_on_sale": false,
    "discount": 0,
    "description": "Step into the world of ninjas with this Naruto Sasuke Uchiha 3D keychain, embodying the courage and determination of Naruto Uzumaki.",
    "in_stock": true,
    "stock_quantity": 1,
    "power_points": 95,
    "created_at": "2025-10-11T03:06:56.435Z",
    "updated_at": "2025-10-11T03:06:56.435Z"
  }
];

// MongoDB operations
async function getProductsCollection() {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await getCollection(COLLECTIONS.PRODUCTS);
  } catch (e) {
    return null;
  }
}

// Get all products
async function getAllProducts() {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const docs = await collection.find({}).toArray();
      return docs.map(mapDbProductToApi);
    }
  } catch (e) {
    console.error('Error fetching products from database:', e);
  }
  
  // Fallback to in-memory store
  return products;
}

// Get product by ID
async function getProductById(id) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const doc = await collection.findOne({ id: id });
      return doc ? mapDbProductToApi(doc) : null;
    }
  } catch (e) {
    console.error('Error fetching product from database:', e);
  }
  
  // Fallback to in-memory store
  return products.find(p => p.id === id) || null;
}

// Get products by category
async function getProductsByCategory(category) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const docs = await collection.find({ category: category }).toArray();
      return docs.map(mapDbProductToApi);
    }
  } catch (e) {
    console.error('Error fetching products by category from database:', e);
  }
  
  // Fallback to in-memory store
  return products.filter(p => p.category === category);
}

// Search products
async function searchProducts(query) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const docs = await collection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).toArray();
      return docs.map(mapDbProductToApi);
    }
  } catch (e) {
    console.error('Error searching products in database:', e);
  }
  
  // Fallback to in-memory store
  const lowercaseQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.category.toLowerCase().includes(lowercaseQuery)
  );
}

// Add new product
async function addProduct(productData) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const newProduct = {
        ...productData,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await collection.insertOne(newProduct);
      return mapDbProductToApi(newProduct);
    }
  } catch (e) {
    console.error('Error adding product to database:', e);
  }
  
  // Fallback to in-memory store
  const newProduct = {
    ...productData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  products.push(newProduct);
  return newProduct;
}

// Update product
async function updateProduct(id, updateData) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const updatedProduct = {
        ...updateData,
        id: id,
        updated_at: new Date().toISOString()
      };
      const result = await collection.updateOne({ id: id }, { $set: updatedProduct });
      if (result.modifiedCount > 0) {
        return mapDbProductToApi(updatedProduct);
      }
      return null;
    }
  } catch (e) {
    console.error('Error updating product in database:', e);
  }
  
  // Fallback to in-memory store
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updateData,
      id: id,
      updated_at: new Date().toISOString()
    };
    return products[index];
  }
  return null;
}

// Delete product
async function deleteProduct(id) {
  try {
    const collection = await getProductsCollection();
    if (collection) {
      const result = await collection.deleteOne({ id: id });
      return result.deletedCount > 0;
    }
  } catch (e) {
    console.error('Error deleting product from database:', e);
  }
  
  // Fallback to in-memory store
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    return true;
  }
  return false;
}

// Helper function to map database product to API format
function mapDbProductToApi(doc) {
  if (!doc) return null;
  return {
    id: doc.id || doc._id,
    name: doc.name || '',
    price: doc.price || 0,
    original_price: doc.original_price || doc.price || 0,
    image: doc.image || '/placeholder-product.jpg',
    images: Array.isArray(doc.images) ? doc.images : [doc.image || '/placeholder-product.jpg'],
    category: doc.category || 'Anime Figures',
    category_slug: doc.category_slug || (doc.category || 'Anime Figures').toLowerCase().replace(/\s+/g, '-'),
    rating: doc.rating || 4.5,
    reviews: doc.reviews || 0,
    is_new: doc.is_new || false,
    is_on_sale: doc.is_on_sale || false,
    discount: doc.discount || 0,
    description: doc.description || '',
    in_stock: doc.in_stock !== undefined ? doc.in_stock : (doc.stock_quantity > 0),
    stock_quantity: doc.stock_quantity || 0,
    power_points: doc.power_points || 0,
    created_at: doc.created_at || new Date().toISOString(),
    updated_at: doc.updated_at || new Date().toISOString()
  };
}

// Compatibility functions for backward compatibility
const add = addProduct;
const update = updateProduct;
const delete = deleteProduct;
const getAll = getAllProducts;
const getById = getProductById;
const getByCategory = getProductsByCategory;
const search = searchProducts;

// Initialize function for compatibility
const init = async () => {
  // Initialize database connection
  try {
    await getProductsCollection();
    console.log('✅ Products store initialized');
  } catch (error) {
    console.log('⚠️ Products store initialized with in-memory fallback');
  }
};

module.exports = {
  // New async functions
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  
  // Compatibility aliases
  add,
  update,
  delete: delete,
  getAll,
  getById,
  getByCategory,
  search,
  init,
  
  // Data export
  products // Export for backward compatibility
};
