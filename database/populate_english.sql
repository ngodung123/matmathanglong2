USE mat_ma_thang_long;

-- =========================================================
-- 1. ACHIEVEMENTS
-- =========================================================

UPDATE achievements SET
    title_en = 'Scholar''s First Step',
    description_en = 'Complete your first checkpoint.'
WHERE id = 'first-step';

UPDATE achievements SET
    title_en = 'Keen Eye of the Temple',
    description_en = 'Collect 5 clues.'
WHERE id = 'clue-hunter';

UPDATE achievements SET
    title_en = 'Master Decoder',
    description_en = 'Answer 10 puzzles correctly in a row.'
WHERE id = 'decoder';

UPDATE achievements SET
    title_en = 'Master of Thang Long',
    description_en = 'Complete all 7 checkpoints.'
WHERE id = 'master';

UPDATE achievements SET
    title_en = 'Collector',
    description_en = 'Collect 15 items.'
WHERE id = 'collector';

UPDATE achievements SET
    title_en = 'Confucian Scholar',
    description_en = 'Complete 3 checkpoints.'
WHERE id = 'scholar';

UPDATE achievements SET
    title_en = 'Temple Detective',
    description_en = 'Complete 5 checkpoints.'
WHERE id = 'explorer';

UPDATE achievements SET
    title_en = 'XP Royalty',
    description_en = 'Earn 500 XP.'
WHERE id = 'xp-king';

UPDATE achievements SET
    title_en = 'Speed Scholar',
    description_en = 'Complete 2 checkpoints in a row.'
WHERE id = 'speed';

UPDATE achievements SET
    title_en = 'Absolute Perfection',
    description_en = 'Complete the entire collection.'
WHERE id = 'perfect';


-- =========================================================
-- 2. COLLECTIBLES
-- =========================================================

UPDATE collectibles SET
    name_en = 'Nghe',
    category_en = 'Guardian'
WHERE id = 'nghe';

UPDATE collectibles SET
    name_en = 'Carp',
    category_en = 'Guardian'
WHERE id = 'ca-chep';

UPDATE collectibles SET
    name_en = 'Dragon',
    category_en = 'Guardian'
WHERE id = 'rong';

UPDATE collectibles SET
    name_en = 'Crane',
    category_en = 'Guardian'
WHERE id = 'hac';

UPDATE collectibles SET
    name_en = 'Stone Turtle',
    category_en = 'Guardian'
WHERE id = 'rua-da';

UPDATE collectibles SET
    name_en = 'Qilin',
    category_en = 'Guardian'
WHERE id = 'ky-lan';

UPDATE collectibles SET
    name_en = 'Phoenix',
    category_en = 'Guardian'
WHERE id = 'phuong';

UPDATE collectibles SET
    name_en = 'Lion',
    category_en = 'Guardian'
WHERE id = 'lan';

UPDATE collectibles SET
    name_en = 'Khue Van Pavilion',
    category_en = 'Architecture'
WHERE id = 'khue-van';

UPDATE collectibles SET
    name_en = 'Van Mieu Gate',
    category_en = 'Architecture'
WHERE id = 'van-mieu-mon';

UPDATE collectibles SET
    name_en = 'Doctoral Stelae',
    category_en = 'Architecture'
WHERE id = 'bia-tien-si';

UPDATE collectibles SET
    name_en = 'Twin Pavilion',
    category_en = 'Architecture'
WHERE id = 'gac-doi';

UPDATE collectibles SET
    name_en = 'Dai Thanh Gate',
    category_en = 'Architecture'
WHERE id = 'dai-thanh-mon';

UPDATE collectibles SET
    name_en = 'Thai Hoc Hall',
    category_en = 'Architecture'
WHERE id = 'nha-thai-hoc';

UPDATE collectibles SET
    name_en = 'Thien Quang Well',
    category_en = 'Architecture'
WHERE id = 'gieng-thien';

UPDATE collectibles SET
    name_en = 'Dai Thanh Shrine',
    category_en = 'Architecture'
WHERE id = 'dien-dai';

UPDATE collectibles SET
    name_en = 'Scroll',
    category_en = 'Symbol'
WHERE id = 'cuon-thu';

UPDATE collectibles SET
    name_en = 'Khuê Star',
    category_en = 'Symbol'
WHERE id = 'sao-khue';

UPDATE collectibles SET
    name_en = 'Dong Son Drum',
    category_en = 'Symbol'
WHERE id = 'trong-dong';

UPDATE collectibles SET
    name_en = 'Apricot Blossom',
    category_en = 'Symbol'
WHERE id = 'hoa-mai';

UPDATE collectibles SET
    name_en = 'Octagon',
    category_en = 'Symbol'
WHERE id = 'bat-giac';

UPDATE collectibles SET
    name_en = 'Vermilion Seal',
    category_en = 'Symbol'
WHERE id = 'trieu-son';

UPDATE collectibles SET
    name_en = 'Bodhi Leaf',
    category_en = 'Symbol'
WHERE id = 'la-bo-de';

UPDATE collectibles SET
    name_en = 'Golden Seal',
    category_en = 'Symbol'
WHERE id = 'an-vang';

UPDATE collectibles SET
    name_en = 'Gourd Bottle',
    category_en = 'Item'
WHERE id = 'binh-ho-lo';

UPDATE collectibles SET
    name_en = 'Lotus Bud',
    category_en = 'Item'
WHERE id = 'bup-sen';

UPDATE collectibles SET
    name_en = 'Bell',
    category_en = 'Item'
WHERE id = 'chuong';

UPDATE collectibles SET
    name_en = 'Lantern',
    category_en = 'Item'
WHERE id = 'den-long';

UPDATE collectibles SET
    name_en = 'Chinese Ink',
    category_en = 'Item'
WHERE id = 'muc-tau';

UPDATE collectibles SET
    name_en = 'Inkstone',
    category_en = 'Item'
WHERE id = 'nghien';

UPDATE collectibles SET
    name_en = 'Calligraphy Brush',
    category_en = 'Item'
WHERE id = 'but-long';

UPDATE collectibles SET
    name_en = 'Agarwood',
    category_en = 'Item'
WHERE id = 'tram-huong';

UPDATE collectibles SET
    name_en = 'Conical Hat',
    category_en = 'Item'
WHERE id = 'non-la';

UPDATE collectibles SET
    name_en = 'Book of Classics',
    category_en = 'Item'
WHERE id = 'cuon-kinh';


-- =========================================================
-- 3. MISSIONS
-- =========================================================

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='To cross the boundary from the ordinary world into this sacred place, you must have a keen eye.',
observation_instruction_en='Look up at the top of the two tall ornamental pillars ahead.',
put_phone_down_en='Put your phone down and observe carefully — what shape is the decoration at the top of the pillar?',
question_en='Which mythical creature stands proudly on top of the two ornamental pillars?',
hint_en='A uniquely Vietnamese guardian creature, combining features of a dog and a lion. It usually sits facing outward.',
collectible_name_en='Nghê Guardian',
collectible_flavour_en='The Nghê is a uniquely Vietnamese guardian creature, representing protection and wisdom. Unlike the foreign qilin, the Nghê has deep indigenous Vietnamese characteristics.',
clue_unlocked_en='The Nghê guards knowledge → Find the Nghê inside the inner grounds!'
WHERE checkpoint_id=1 AND id=1;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='Tam Quan — three passages symbolizing three paths to knowledge. Count carefully.',
observation_instruction_en='Stand in front of the gate and count the passages of Van Mieu Gate.',
put_phone_down_en='Look straight at the gate — count the doorways from left to right.',
question_en='How many passages does Van Mieu Gate have in total?',
hint_en='"Tam" in "Tam Quan" refers to the number of passages.',
collectible_name_en='Tam Quan Secret',
collectible_flavour_en='The three passages of Tam Quan: the central passage was for the king, while the two side passages were for officials and common people. Social status was defined from the very first step.',
clue_unlocked_en='Three passages → Three social levels of the past → Who used each passage?'
WHERE checkpoint_id=1 AND id=2;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='Colors in ancient Vietnamese architecture were not chosen randomly. Each color carries a sacred meaning.',
observation_instruction_en='Observe the paint colors of the main pillars and walls of Van Mieu Gate.',
put_phone_down_en='Step back a little to see the entire gate — what is the dominant color?',
question_en='What is the dominant paint color of Van Mieu Gate?',
hint_en='This color symbolizes luck, power, and protection in East Asian culture.',
collectible_name_en='Vermilion Secret',
collectible_flavour_en='Vermilion red was widely used throughout the Temple of Literature to ward off evil and express the solemnity of this sacred place of learning.',
clue_unlocked_en='Vermilion red → the color of knowledge and power → Find more of this color!'
WHERE checkpoint_id=1 AND id=3;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The orientation of the building was not chosen randomly. Ancient people selected directions according to feng shui and astronomy.',
observation_instruction_en='Use a compass or observe the position of the sun — which direction does Van Mieu Gate face?',
put_phone_down_en='Stand in front of the gate, feel the sunlight, and determine the direction.',
question_en='Which direction does the Temple of Literature – Imperial Academy face?',
hint_en='According to ancient feng shui, this direction represents the light of knowledge, opposite the darkness of the north.',
collectible_name_en='Feng Shui Compass',
collectible_flavour_en='The south represents light, wisdom, and prosperity. Educational buildings traditionally faced south according to East Asian feng shui principles.',
clue_unlocked_en='South → The light of knowledge → Find the stone tablet facing south!'
WHERE checkpoint_id=1 AND id=4;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='This flower is not only beautiful — it symbolizes purity, rising from the mud without being stained by it.',
observation_instruction_en='Look around the bases of the pillars and walls — what flower is carved as decoration?',
put_phone_down_en='Look down at the base of the pillars — what flower is carved there?',
question_en='Which flower is carved as decoration at the base of the Van Mieu Gate pillars?',
hint_en='It grows from mud yet remains fragrant — a symbol of the noble person rising above difficult circumstances.',
collectible_name_en='Temple Lotus',
collectible_flavour_en='The lotus is a symbol of Buddhism and Vietnamese Confucianism — a pure beauty untouched by mud, like a student maintaining integrity in every circumstance.',
clue_unlocked_en='Lotus blooms → Students → Find the lotus around Thien Quang Lake!'
WHERE checkpoint_id=1 AND id=5;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='This is the second boundary. Every step deeper brings you closer to the peak of knowledge.',
observation_instruction_en='Observe the roof of Dai Trung Gate from outside — how many roof levels are there?',
put_phone_down_en='Step back and look up — count each overlapping roof level.',
question_en='How many roof levels does Dai Trung Gate have?',
hint_en='"Trung thiêm điệp ốc" is a style featuring two roof levels commonly found in Vietnamese royal architecture.',
collectible_name_en='Ancient Roof Tile',
collectible_flavour_en='The double-layer curved roof tiles are characteristic of ancient Vietnamese architecture — beautiful while effectively protecting buildings from tropical rain and sunlight.',
clue_unlocked_en='Double roof → Two worlds → Inside and outside.'
WHERE checkpoint_id=2 AND id=1;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='The roof ridge is often decorated with a special mythical creature — a powerful symbol of heaven and earth.',
observation_instruction_en='Look up at the roof ridge of Dai Trung Gate — what image is decorating it?',
put_phone_down_en='Find a clear viewpoint and look directly at the roof ridge — what shape is in the center?',
question_en='What distinctive decoration appears on the roof ridge of Dai Trung Gate?',
hint_en='"Luong long" means two dragons. "Chau nguyet" means facing the moon. The image represents harmony between yin and yang.',
collectible_name_en='Jade Double Dragon',
collectible_flavour_en='The double dragons facing the moon symbolize balance between yin and yang, heaven and earth. This motif is common in Vietnamese royal and scholarly architecture.',
clue_unlocked_en='Double dragons → Yin and yang → Find this symbol at Dai Thanh Shrine!'
WHERE checkpoint_id=2 AND id=2;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='The wood used for these doors is not ordinary wood. Ancient craftsmen chose it very carefully.',
observation_instruction_en='Approach the Dai Trung Gate doors — gently tap them and notice the color and hardness.',
put_phone_down_en='Place your hand on the door — feel the material and observe the color of the wood.',
question_en='What type of wood are the Dai Trung Gate doors mainly made from?',
hint_en='One of the hardest woods in Vietnam, capable of surviving for hundreds of years under rain and sunlight.',
collectible_name_en='Ancient Lim Wood',
collectible_flavour_en='Lim wood (Erythrophleum fordii) is one of the hardest woods in Southeast Asia and can survive for over 500 years with proper care. Ancient craftsmen used it for important structures.',
clue_unlocked_en='Lim wood → Durability → Like knowledge passed down through generations.'
WHERE checkpoint_id=2 AND id=3;

UPDATE missions SET
observation_tag_en='EXPLORE',
van_dong_dialogue_en='The Temple of Literature is divided into five areas. Each gate marks a boundary between different sacred spaces.',
observation_instruction_en='Stand before Dai Trung Gate and look through it — what area appears inside?',
put_phone_down_en='Look through the open gate — what is the first thing you see inside?',
question_en='After passing through Dai Trung Gate, which area appears directly ahead?',
hint_en='The third area of the Temple of Literature — home to the mirror-like lake and 82 doctoral stelae.',
collectible_name_en='Thien Quang Water',
collectible_flavour_en='Thien Quang Well ("Well of Heavenly Light") lies at the center of the doctoral stelae area. Its calm surface reflects the sky and Khue Van Pavilion like a mirror.',
clue_unlocked_en='Thien Quang Lake → Reflection → Who is reflected?'
WHERE checkpoint_id=2 AND id=4;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The word "Trung" on this gate has a profound philosophical meaning in Confucianism.',
observation_instruction_en='Read the Chinese characters carved on the gate sign.',
put_phone_down_en='Look up at the gate sign — what do the three Chinese characters mean?',
question_en='What does "Dai Trung" mean in the context of Confucianism?',
hint_en='In Confucianism, "Trung" does not mean the physical middle — it means an unbiased moral standard.',
collectible_name_en='Doctrine of the Mean',
collectible_flavour_en='The Doctrine of the Mean is one of the most important Four Books of Confucianism. It teaches people to avoid excess and deficiency and maintain perfect harmony.',
clue_unlocked_en='The Mean → Harmony → Find the symbol of balance at Dai Thanh Shrine!'
WHERE checkpoint_id=2 AND id=5;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='Khue Van Pavilion — the jewel of the Temple of Literature. Its windows conceal a philosophy of the universe.',
observation_instruction_en='Look up at the upper floor of Khue Van Pavilion — what shape are the windows?',
put_phone_down_en='Step back and look up — what is the shape of the four windows on the upper floor?',
question_en='What special shape do the windows on the upper floor of Khue Van Pavilion have?',
hint_en='This shape symbolizes the sky, contrasting with the square earth below — the ancient heaven-and-earth philosophy.',
collectible_name_en='Heavenly Circle',
collectible_flavour_en='The round windows of Khue Van Pavilion symbolize the sky — "round heaven, square earth." Sunlight passing through creates golden circles on the stone floor.',
clue_unlocked_en='Round heaven, square earth → Ancient philosophy → Find it in the architecture of the Shrine!'
WHERE checkpoint_id=3 AND id=1;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The year carved into the stone base records when King Gia Long ordered the construction of this building.',
observation_instruction_en='Find the sign or inscription showing the construction year of Khue Van Pavilion.',
put_phone_down_en='Walk around the pavilion and find the historical information sign — what year was it built?',
question_en='In what year was Khue Van Pavilion built?',
hint_en='This was the fourth year of the Gia Long era — the first emperor of the Nguyen Dynasty, who unified Vietnam.',
collectible_name_en='Gia Long Edict',
collectible_flavour_en='In 1805, King Gia Long ordered the construction of Khue Van Pavilion to honor scholarship. The building took two years to complete and remains a symbol of Hanoi today.',
clue_unlocked_en='1805 → Nguyen Dynasty → Find more traces of this historical period!'
WHERE checkpoint_id=3 AND id=2;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='"Khue" is the name of a special star — the star of writers and scholars.',
observation_instruction_en='Look at the pavilion name — which star does the character "Khue" correspond to in astronomy?',
put_phone_down_en='Read the information near Khue Van Pavilion — which constellation does the Khue star belong to?',
question_en='What does the Khue Star (奎) symbolize in ancient East Asian astronomy?',
hint_en='Among the Twenty-Eight Mansions, this star governs writing, literature, and scholarly examinations.',
collectible_name_en='Khue Star Map',
collectible_flavour_en='The Khue Star (Kui Mansion) belongs to the White Tiger group in ancient western astronomy. Ancient people believed it illuminated those who studied well and achieved academic success.',
clue_unlocked_en='Khue Star → Literature → Find the poem carved inside the grounds!'
WHERE checkpoint_id=3 AND id=3;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='The pavilion stands firmly on special supporting pillars — observe the materials carefully.',
observation_instruction_en='Approach and touch the pillars supporting the upper floor — what materials are used?',
put_phone_down_en='Gently touch the pillar — wood or brick? Observe its color and texture.',
question_en='How many supporting pillars does Khue Van Pavilion stand on?',
hint_en='Four square brick pillars below + four round wooden pillars above = how many in total?',
collectible_name_en='Ancient Brick Pillar',
collectible_flavour_en='Khue Van Pavilion stands on eight pillars: four square brick pillars symbolizing earth and four round wooden pillars symbolizing heaven. The philosophy of "round heaven, square earth" appears in every detail.',
clue_unlocked_en='8 pillars → 4 + 4 → Heaven and earth united!'
WHERE checkpoint_id=3 AND id=4;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='Look below Khue Van Pavilion — the lake is calm like a natural mirror.',
observation_instruction_en='From the upper floor, look down — what body of water reflects Khue Van Pavilion?',
put_phone_down_en='Stand on the pavilion and look ahead — on which water surface is the pavilion reflected?',
question_en='Which lake does the reflection of Khue Van Pavilion appear in?',
hint_en='"Thien Quang" means heavenly light — the name of the lake directly below the pavilion.',
collectible_name_en='Heavenly Light Mirror',
collectible_flavour_en='Thien Quang Lake is known as the "mirror of heaven," reflecting Khue Van Pavilion and the sky. Ancient scholars often paused to admire their reflection before examinations.',
clue_unlocked_en='Thien Quang → Reflection → Who is reflected?'
WHERE checkpoint_id=3 AND id=5;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='This is where the names of the most talented people of Dai Viet were carved in stone for future generations.',
observation_instruction_en='Count the stelae houses on both sides of Thien Quang Lake — how many stelae are there in total?',
put_phone_down_en='Walk along the rows of stelae and count — each stele rests on a stone turtle.',
question_en='How many doctoral stelae are currently preserved at the Temple of Literature?',
hint_en='The number is smaller than the total number of doctoral examination cycles because some stelae were lost through war and time.',
collectible_name_en='Doctoral Stele Fragment',
collectible_flavour_en='There were originally 116 stelae, but only 82 remain preserved due to time and war. In 2010, UNESCO recognized the collection as a Memory of the World heritage.',
clue_unlocked_en='82 stelae → The names of scholars → Find the oldest inscription!'
WHERE checkpoint_id=4 AND id=1;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='This animal was not chosen randomly to carry the stelae. It has a special meaning in Vietnamese culture.',
observation_instruction_en='Look carefully at the bases of the stelae — what animal is supporting the stone tablets?',
put_phone_down_en='Look down at the bottom of the stelae — what animal appears there?',
question_en='What animal is carved in stone to support the doctoral stelae?',
hint_en='This animal lives for hundreds of years and is believed in Vietnamese mythology to carry the universe on its back.',
collectible_name_en='Stone Turtle',
collectible_flavour_en='The turtle (Quy) is one of the Four Sacred Creatures. The turtle carrying a stele symbolizes the lasting nature of knowledge. Each turtle is carved differently, reflecting the artistic style of its dynasty.',
clue_unlocked_en='Stone turtle → Longevity → Find another symbol of enduring knowledge!'
WHERE checkpoint_id=4 AND id=2;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The oldest stele records scholars from the early Le period — nearly 600 years ago.',
observation_instruction_en='Find the oldest doctoral stele using the information sign — what year was it first erected?',
put_phone_down_en='Follow the sign to the first stele — read the year carved on it.',
question_en='In what year was the first doctoral stele erected?',
hint_en='King Le Thanh Tong ordered the stelae to be erected to encourage talented people and discourage laziness.',
collectible_name_en='Ancient Stele',
collectible_flavour_en='King Le Thanh Tong (1442–1497) ordered the first stelae to be erected in 1484, recording 1,017 scholars from 1442 onward. He also greatly expanded Dai Viet.',
clue_unlocked_en='1484 → Le Dynasty → Find more traces of this period!'
WHERE checkpoint_id=4 AND id=3;

UPDATE missions SET
observation_tag_en='EXPLORE',
van_dong_dialogue_en='"Thien Quang" — heavenly light shines down into this well each day like a blessing for scholars.',
observation_instruction_en='Read the meaning of "Thien Quang Tinh" — what do the three characters mean?',
put_phone_down_en='Find the sign explaining the name of the lake — read and remember its meaning.',
question_en='What is the literal meaning of "Thien Quang Tinh" (天光井)?',
hint_en='"Thien" = heaven, "Quang" = light or radiance, "Tinh" = well.',
collectible_name_en='Heavenly Light Well',
collectible_flavour_en='Thien Quang Lake was designed so sunlight could shine directly down at noon — a metaphor for knowledge illuminating the minds of students.',
clue_unlocked_en='Heavenly light → Enlightenment → Find the place where knowledge is recorded!'
WHERE checkpoint_id=4 AND id=4;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='Read some of the names on the stelae — this is a list of the most outstanding scholars of Vietnam.',
observation_instruction_en='Find the total number of doctoral laureates recorded on all 82 stelae.',
put_phone_down_en='Find a statistical panel or introductory leaflet — what is the total number?',
question_en='How many doctoral laureates are named on the 82 stelae?',
hint_en='The number spans 26 reigns of the Le and Mac dynasties, from 1442 to 1779.',
collectible_name_en='Doctoral Roll',
collectible_flavour_en='1,307 doctoral laureates over 337 years — an average of only four scholars per year achieved the highest academic title. Among them were Nguyen Trai, Le Quy Don, and many other historical figures.',
clue_unlocked_en='1,307 scholars → Centuries of learning → Discover the great scholars!'
WHERE checkpoint_id=4 AND id=5;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The sage worshipped beyond this gate laid the foundation for learning across Asia.',
observation_instruction_en='Read the information sign in front of Dai Thanh Gate — who is the principal figure worshipped here?',
put_phone_down_en='Find the introductory panel — read the name of the sage worshipped in Dai Thanh Shrine.',
question_en='Whom do you enter the worship area to honor after passing Dai Thanh Gate?',
hint_en='"Teacher of Ten Thousand Generations" is the title of the founder of Confucianism.',
collectible_name_en='Confucius Scroll',
collectible_flavour_en='Confucius (551–479 BCE) founded Confucianism. His ideas shaped Asian culture for more than 2,500 years.',
clue_unlocked_en='Confucius → The teacher of generations → Find the Four Assessors!'
WHERE checkpoint_id=5 AND id=1;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='"Dai Thanh" — supreme completion. The name does not simply mean "great achievement."',
observation_instruction_en='Read the explanation of the name "Dai Thanh Gate" — what does it truly mean?',
put_phone_down_en='Find the sign explaining the name of the gate and read the details carefully.',
question_en='What does "Dai Thanh" (大成) mean in the context of Confucianism?',
hint_en='Mencius called Confucius "Dai Thanh" — the one who perfected the virtues of the sages.',
collectible_name_en='Great Completion Gem',
collectible_flavour_en='"Dai Thanh Chi Thanh" is the full title of Confucius in Vietnamese Confucian tradition. Mencius described Confucius as the one who brought together and perfected the virtues of earlier sages.',
clue_unlocked_en='Great Completion → Perfect virtue → Find the symbol of wisdom!'
WHERE checkpoint_id=5 AND id=2;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='The Nghê guards both sides of the gate — but these are different from the Nghê on the outer pillars.',
observation_instruction_en='Observe both sides of Dai Thanh Gate — what is guarding the entrance?',
put_phone_down_en='Look to both sides of the gate — what guardian creature is standing there?',
question_en='What creature guards both sides of Dai Thanh Gate?',
hint_en='This guardian appears both on the outer ornamental pillars and the inner gate — it is a characteristic guardian of the Temple of Literature.',
collectible_name_en='Stone Nghê',
collectible_flavour_en='The stone Nghê at Dai Thanh Gate was carved during the Le–Nguyen periods. Its face is gentle yet solemn, characteristic of Vietnamese sculpture from the eighteenth century.',
clue_unlocked_en='Stone Nghê → Temple guardian → Find another Vietnamese guardian!'
WHERE checkpoint_id=5 AND id=3;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='The color of the doors here matches the color seen outside — a consistent color scheme throughout the Temple of Literature.',
observation_instruction_en='Look at the large wooden doors of Dai Thanh Gate — what color are they painted?',
put_phone_down_en='Observe carefully the color of the wooden doors in front of you.',
question_en='What color are the wooden doors of Dai Thanh Gate painted?',
hint_en='It is the same color used on walls and pillars throughout the Temple of Literature — called "chu sa" or vermilion.',
collectible_name_en='Vermilion Brush',
collectible_flavour_en='Vermilion is a bright red pigment traditionally associated with solemnity and protection. Ancient people believed the color could ward off evil and attract good fortune.',
clue_unlocked_en='Vermilion red → Sacred color → Find it throughout the Temple!'
WHERE checkpoint_id=5 AND id=4;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='Throughout history, a great Vietnamese teacher was worshipped here alongside Confucius.',
observation_instruction_en='Find information about the most famous Vietnamese teacher worshipped at the Temple of Literature.',
put_phone_down_en='Find the information panel about the figures worshipped here — who is the only Vietnamese figure?',
question_en='Who is the only Vietnamese person worshipped at the Temple of Literature alongside Confucius?',
hint_en='He submitted the "Seven Executions Memorial," demanding the punishment of seven corrupt officials, and refused office when the king ignored his advice.',
collectible_name_en='Teacher Chu Van An',
collectible_flavour_en='Chu Van An (1292–1370) is one of Vietnam''s most revered teachers. His students included high-ranking officials. He resigned and retired when the king ignored his advice.',
clue_unlocked_en='Chu Van An → The great teacher → Discover his legacy!'
WHERE checkpoint_id=5 AND id=5;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='This is the most sacred place. Enter with a respectful heart.',
observation_instruction_en='Look at the main altar in the center of Dai Thanh Shrine — who occupies the central position?',
put_phone_down_en='Enter the shrine and look directly at the main altar — who is in the highest central position?',
question_en='Who is worshipped at the highest central position in Dai Thanh Shrine?',
hint_en='"Teacher of Ten Thousand Generations" — the teacher of all ages. The largest golden statue stands in the center.',
collectible_name_en='Sacred Shrine',
collectible_flavour_en='The statue of Confucius in Dai Thanh Shrine is covered in gold and sits solemnly on a throne. The Four Assessors are placed on both sides. Incense has been offered here for centuries.',
clue_unlocked_en='Confucius → Four Assessors → Discover the sacred center!'
WHERE checkpoint_id=6 AND id=1;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='Four of Confucius'' greatest disciples stand beside him — the Four Assessors. Count and observe them.',
observation_instruction_en='Count the statues or secondary altars on both sides of Confucius.',
put_phone_down_en='Look to both sides of the statue of Confucius — count the figures worshipped alongside him.',
question_en='How many sages are worshipped alongside Confucius as the Four Assessors?',
hint_en='"Tu" means the number four in Chinese. The Four Assessors are Yan Hui, Zeng Shen, Zi Si, and Mencius.',
collectible_name_en='Four Assessors',
collectible_flavour_en='The Four Assessors are four of Confucius'' greatest disciples: Yan Hui, Zeng Shen, Zi Si, and Mencius. Each developed an important aspect of Confucian thought.',
clue_unlocked_en='Four Assessors → Four great scholars → Discover their teachings!'
WHERE checkpoint_id=6 AND id=2;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='Incense never stops burning here — special offerings are presented to the sage of knowledge.',
observation_instruction_en='Look at the offerings on the altar — what is being offered?',
put_phone_down_en='Observe the altar — what is burning in the incense burners? What flowers are being offered?',
question_en='Which flower is commonly offered at Dai Thanh Shrine?',
hint_en='A flower symbolizing purity and virtue — you saw it earlier at the base of the Van Mieu Gate pillars.',
collectible_name_en='Lotus Bud',
collectible_flavour_en='White lotus flowers are traditional offerings in ceremonies honoring Confucius. Their white color symbolizes the purity of a scholar''s heart.',
clue_unlocked_en='Lotus → Purity → Find another lotus symbol!'
WHERE checkpoint_id=6 AND id=3;

UPDATE missions SET
observation_tag_en='OBSERVE',
van_dong_dialogue_en='The architecture of this shrine reflects royal style — large red-painted wooden pillars and curved tiled roofs.',
observation_instruction_en='Count the large pillars inside Dai Thanh Shrine.',
put_phone_down_en='Enter and carefully count the rows of large wooden pillars — how many are there?',
question_en='How many large wooden pillars are inside Dai Thanh Shrine?',
hint_en='Count four rows of pillars: the outer rows first, then the inner rows.',
collectible_name_en='Red Wooden Pillar',
collectible_flavour_en='Sixteen large lim-wood pillars are painted vermilion and support the roof. The two-tier "trung thiêm điệp ốc" style represents the height of Vietnamese royal architecture.',
clue_unlocked_en='16 pillars → Structure and balance → Discover the architecture!'
WHERE checkpoint_id=6 AND id=4;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The ceremony here is held exactly twice a year according to traditional Confucian practice.',
observation_instruction_en='Find information about the annual ceremonies honoring Confucius.',
put_phone_down_en='Read the information board about the ceremony schedule — in which months does it take place?',
question_en='How many times each year is the ceremony honoring Confucius held at Dai Thanh Shrine?',
hint_en='"Spring and Autumn, two ceremonies" — one in spring and one in autumn.',
collectible_name_en='Ceremonial Calendar',
collectible_flavour_en='The two annual ceremonies correspond to sowing in spring and harvesting in autumn — a metaphor for learning: planting knowledge and harvesting results.',
clue_unlocked_en='Spring and autumn → Plant knowledge, harvest results!'
WHERE checkpoint_id=6 AND id=5;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='This is the end of the journey — and also the birthplace of Vietnamese education.',
observation_instruction_en='Find the historical information about the founding of the Imperial Academy.',
put_phone_down_en='Read the large sign at the entrance to Thai Hoc Hall — what year was it founded?',
question_en='In what year was the Imperial Academy — Vietnam''s first university — established?',
hint_en='King Ly Nhan Tong established the school one year after building the Temple of Literature in 1070 to train officials.',
collectible_name_en='Imperial Academy Medal',
collectible_flavour_en='In 1076, King Ly Nhan Tong established the Imperial Academy, opening a new era of Vietnamese education. It was Vietnam''s first university.',
clue_unlocked_en='1076 → Imperial Academy → The beginning of Vietnamese higher education!'
WHERE checkpoint_id=7 AND id=1;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='Not everyone was allowed to study here at first. Discover who was originally admitted.',
observation_instruction_en='Find information about the original students of the Imperial Academy.',
put_phone_down_en='Read the introductory board — who was allowed to study at the Imperial Academy in its early years?',
question_en='Who was originally allowed to study at the Imperial Academy?',
hint_en='"Quoc Tu" means children of the state — members of the royal family and nobility. At first, the school was reserved for the upper class.',
collectible_name_en='Royal Scholar Badge',
collectible_flavour_en='The Imperial Academy initially accepted children of kings and high-ranking officials. Later, talented commoners were also admitted — a major educational breakthrough for the era.',
clue_unlocked_en='Royal students → Expanded access → Discover the history of education!'
WHERE checkpoint_id=7 AND id=2;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='The curriculum here was very different from a modern school. The main subjects were classical Confucian texts.',
observation_instruction_en='Find information about the curriculum taught at Thai Hoc Hall.',
put_phone_down_en='Read the curriculum information board — what was the main subject of study?',
question_en='What was the main subject taught at the Imperial Academy?',
hint_en='The Four Books and Five Classics — nine classical Confucian works — formed the core of education and examinations.',
collectible_name_en='Confucian Classics',
collectible_flavour_en='The curriculum included the Four Books and Five Classics. Students had to memorize and comment on the texts in classical Chinese.',
clue_unlocked_en='Confucian classics → Scholarship → Discover the ancient curriculum!'
WHERE checkpoint_id=7 AND id=3;

UPDATE missions SET
observation_tag_en='KNOWLEDGE',
van_dong_dialogue_en='A remarkable king broke class barriers and opened the school to talented people from ordinary families.',
observation_instruction_en='Find information about the king who expanded admission to the Imperial Academy.',
put_phone_down_en='Read about the school''s development — who was the first to admit talented commoners?',
question_en='Which king expanded the Imperial Academy to accept talented students from ordinary families?',
hint_en='He was also the king who established the school in 1076 — he founded it and expanded access.',
collectible_name_en='Open Education Seal',
collectible_flavour_en='King Ly Nhan Tong (1066–1128) not only founded the school but also allowed talented students from common families to study there. This was an early idea of educational equality.',
clue_unlocked_en='Ly Nhan Tong → Open education → Knowledge belongs to everyone!'
WHERE checkpoint_id=7 AND id=4;

UPDATE missions SET
observation_tag_en='EXPLORE',
van_dong_dialogue_en='Your journey is almost complete. The final question — but perhaps the most important one.',
observation_instruction_en='Find the reconstruction year of Thai Hoc Hall on the information board.',
put_phone_down_en='Read the introduction to Thai Hoc Hall — in what year was the building reconstructed?',
question_en='In what year was the current Thai Hoc Hall reconstructed?',
hint_en='Thai Hoc Hall was reconstructed for the 990th anniversary of Thang Long, shortly before the 1,000th anniversary celebration in 2010.',
collectible_name_en='Grand Scholar Trophy',
collectible_flavour_en='Congratulations! You have explored the entire Temple of Literature – Imperial Academy and earned the title of Grand Scholar. Like the doctoral laureates of old, you overcame every challenge through keen observation and deep knowledge.',
clue_unlocked_en='Journey complete → Grand Scholar → You have mastered the Temple!'
WHERE checkpoint_id=7 AND id=5;


-- =========================================================
-- 4. MISSION OPTIONS
-- =========================================================

UPDATE mission_options SET label_en='Nghê', sub_en='Uniquely Vietnamese guardian'
WHERE checkpoint_id=1 AND mission_id=1 AND option_id='nghe';

UPDATE mission_options SET label_en='Dragon', sub_en='Long – noble mythical creature'
WHERE checkpoint_id=1 AND mission_id=1 AND option_id='rong';

UPDATE mission_options SET label_en='Qilin', sub_en='One of the Four Sacred Creatures'
WHERE checkpoint_id=1 AND mission_id=1 AND option_id='kylan';

UPDATE mission_options SET label_en='Phoenix', sub_en='Phung – sacred bird'
WHERE checkpoint_id=1 AND mission_id=1 AND option_id='phuong';

UPDATE mission_options SET label_en='1 passage', sub_en='Single passage'
WHERE checkpoint_id=1 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='2 passages', sub_en='Parallel passages'
WHERE checkpoint_id=1 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='3 passages', sub_en='Tam Quan'
WHERE checkpoint_id=1 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='5 passages', sub_en='Five gates'
WHERE checkpoint_id=1 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='Vermilion red', sub_en='Chu sa – sacred color'
WHERE checkpoint_id=1 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='Yellow', sub_en='Royal color'
WHERE checkpoint_id=1 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='Wood brown', sub_en='Natural wood color'
WHERE checkpoint_id=1 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='Black', sub_en='Solemn color'
WHERE checkpoint_id=1 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='North', sub_en='Royal feng shui direction'
WHERE checkpoint_id=1 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='South', sub_en='Direction of learning and wisdom'
WHERE checkpoint_id=1 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='West', sub_en='Direction of sunset'
WHERE checkpoint_id=1 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='East', sub_en='Direction of sunrise'
WHERE checkpoint_id=1 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='Peach blossom', sub_en='Symbol of spring'
WHERE checkpoint_id=1 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='Lotus', sub_en='Purity and nobility'
WHERE checkpoint_id=1 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='Chrysanthemum', sub_en='Noble seasonal flower'
WHERE checkpoint_id=1 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='Rose', sub_en='Elegant beauty'
WHERE checkpoint_id=1 AND mission_id=5 AND option_id='d';


UPDATE mission_options SET label_en='1 level', sub_en='Simple and elegant'
WHERE checkpoint_id=2 AND mission_id=1 AND option_id='a';

UPDATE mission_options SET label_en='2 levels', sub_en='Double-tier roof'
WHERE checkpoint_id=2 AND mission_id=1 AND option_id='b';

UPDATE mission_options SET label_en='3 levels', sub_en='Three-tier grandeur'
WHERE checkpoint_id=2 AND mission_id=1 AND option_id='c';

UPDATE mission_options SET label_en='4 levels', sub_en='Four-tier majesty'
WHERE checkpoint_id=2 AND mission_id=1 AND option_id='d';

UPDATE mission_options SET label_en='Two dragons facing the moon', sub_en='Two dragons facing the moon'
WHERE checkpoint_id=2 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='Phoenix', sub_en='A single sacred bird'
WHERE checkpoint_id=2 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='Star pattern', sub_en='Geometric decoration'
WHERE checkpoint_id=2 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='Gourd bottle', sub_en='Immortal medicine bottle'
WHERE checkpoint_id=2 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='Lim wood', sub_en='Hard, durable, termite-resistant'
WHERE checkpoint_id=2 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='Bamboo', sub_en='Light, flexible, easy to bend'
WHERE checkpoint_id=2 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='Jackfruit wood', sub_en='Fragrant, yellow-colored'
WHERE checkpoint_id=2 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='Pine wood', sub_en='Light, easy to work with'
WHERE checkpoint_id=2 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='Dai Thanh Shrine', sub_en='Main worship area'
WHERE checkpoint_id=2 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='Thien Quang Lake', sub_en='Sacred lake'
WHERE checkpoint_id=2 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='Thai Hoc Hall', sub_en='Study area'
WHERE checkpoint_id=2 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='Ancient tree garden', sub_en='Quiet space'
WHERE checkpoint_id=2 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='Balanced virtue', sub_en='The principle of the Mean'
WHERE checkpoint_id=2 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='Gate in the middle', sub_en='Central position'
WHERE checkpoint_id=2 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='Great achievement', sub_en='Great accomplishment'
WHERE checkpoint_id=2 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='Great book', sub_en='Storehouse of knowledge'
WHERE checkpoint_id=2 AND mission_id=5 AND option_id='d';


UPDATE mission_options SET label_en='Square', sub_en='Symbolizes earth'
WHERE checkpoint_id=3 AND mission_id=1 AND option_id='a';

UPDATE mission_options SET label_en='Circle', sub_en='Symbolizes heaven'
WHERE checkpoint_id=3 AND mission_id=1 AND option_id='b';

UPDATE mission_options SET label_en='Diamond', sub_en='Four directions and eight points'
WHERE checkpoint_id=3 AND mission_id=1 AND option_id='c';

UPDATE mission_options SET label_en='Hexagon', sub_en='Hive of wisdom'
WHERE checkpoint_id=3 AND mission_id=1 AND option_id='d';

UPDATE mission_options SET label_en='1070', sub_en='Reign of Ly Thanh Tong'
WHERE checkpoint_id=3 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='1484', sub_en='Reign of Le Thanh Tong'
WHERE checkpoint_id=3 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='1805', sub_en='Reign of Gia Long'
WHERE checkpoint_id=3 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='1945', sub_en='Modern era'
WHERE checkpoint_id=3 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='Literature and scholarship', sub_en='Star of scholars'
WHERE checkpoint_id=3 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='War', sub_en='Star of generals'
WHERE checkpoint_id=3 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='Wealth', sub_en='Star of merchants'
WHERE checkpoint_id=3 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='Emperor', sub_en='Star of kings'
WHERE checkpoint_id=3 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='4 pillars', sub_en='Four pillars of heaven and earth'
WHERE checkpoint_id=3 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='6 pillars', sub_en='Perfect hexagon'
WHERE checkpoint_id=3 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='8 pillars', sub_en='Eightfold universe'
WHERE checkpoint_id=3 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='10 pillars', sub_en='Perfect completeness'
WHERE checkpoint_id=3 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='West Lake', sub_en='Largest lake in Hanoi'
WHERE checkpoint_id=3 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='Thien Quang Lake', sub_en='Lake inside the Temple of Literature'
WHERE checkpoint_id=3 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='Hoan Kiem Lake', sub_en='Lake of the returned sacred sword'
WHERE checkpoint_id=3 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='Uncle Ho''s Fish Pond', sub_en='Presidential Palace area'
WHERE checkpoint_id=3 AND mission_id=5 AND option_id='d';


UPDATE mission_options SET label_en='54 stelae', sub_en='Number of provinces and cities in Vietnam'
WHERE checkpoint_id=4 AND mission_id=1 AND option_id='a';

UPDATE mission_options SET label_en='72 stelae', sub_en='Forty-Two Chapters'
WHERE checkpoint_id=4 AND mission_id=1 AND option_id='b';

UPDATE mission_options SET label_en='82 stelae', sub_en='UNESCO World Heritage'
WHERE checkpoint_id=4 AND mission_id=1 AND option_id='c';

UPDATE mission_options SET label_en='108 stelae', sub_en='Number of Liangshan heroes'
WHERE checkpoint_id=4 AND mission_id=1 AND option_id='d';

UPDATE mission_options SET label_en='Stone elephant', sub_en='Symbol of strength'
WHERE checkpoint_id=4 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='Stone Nghê', sub_en='Guardian creature'
WHERE checkpoint_id=4 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='Stone turtle', sub_en='Longevity and endurance'
WHERE checkpoint_id=4 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='Stone tiger', sub_en='Power and courage'
WHERE checkpoint_id=4 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='1076', sub_en='Year the Imperial Academy was founded'
WHERE checkpoint_id=4 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='1253', sub_en='Reign of Tran Thai Tong'
WHERE checkpoint_id=4 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='1484', sub_en='Reign of Le Thanh Tong'
WHERE checkpoint_id=4 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='1802', sub_en='Beginning of the Nguyen Dynasty'
WHERE checkpoint_id=4 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='Well of Heavenly Light', sub_en='Light from heaven'
WHERE checkpoint_id=4 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='Night-sky pond', sub_en='Reflects the stars'
WHERE checkpoint_id=4 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='Hoa Thien Ly Lake', sub_en='Flowers blooming everywhere'
WHERE checkpoint_id=4 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='Golden Moon Well', sub_en='Moonlight reflected in the well'
WHERE checkpoint_id=4 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='500 scholars', sub_en='Five hundred talented people'
WHERE checkpoint_id=4 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='999 scholars', sub_en='Nearly one thousand people'
WHERE checkpoint_id=4 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='1,307 scholars', sub_en='More than one thousand scholars'
WHERE checkpoint_id=4 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='2,000 scholars', sub_en='Two thousand doctoral laureates'
WHERE checkpoint_id=4 AND mission_id=5 AND option_id='d';


UPDATE mission_options SET label_en='Confucius', sub_en='Teacher of Ten Thousand Generations'
WHERE checkpoint_id=5 AND mission_id=1 AND option_id='a';

UPDATE mission_options SET label_en='King Ly Thanh', sub_en='Founder of the Temple of Literature'
WHERE checkpoint_id=5 AND mission_id=1 AND option_id='b';

UPDATE mission_options SET label_en='Chu Van An', sub_en='Great Vietnamese teacher'
WHERE checkpoint_id=5 AND mission_id=1 AND option_id='c';

UPDATE mission_options SET label_en='King Le Loi', sub_en='National hero'
WHERE checkpoint_id=5 AND mission_id=1 AND option_id='d';

UPDATE mission_options SET label_en='Great achievement', sub_en='The highest achievement'
WHERE checkpoint_id=5 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='Complete virtue', sub_en='Absolute perfection'
WHERE checkpoint_id=5 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='Great city', sub_en='Prosperous urban center'
WHERE checkpoint_id=5 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='Perfect treasure', sub_en='Jewel of virtue'
WHERE checkpoint_id=5 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='Stone Nghê', sub_en='Guardian of scholarship'
WHERE checkpoint_id=5 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='Stone dragon', sub_en='Royal guardian creature'
WHERE checkpoint_id=5 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='Stone phoenix', sub_en='Guardian of virtue'
WHERE checkpoint_id=5 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='Stone tiger', sub_en='Guardian of courage'
WHERE checkpoint_id=5 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='Vermilion red', sub_en='Sacred East Asian color'
WHERE checkpoint_id=5 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='Yellow', sub_en='Royal color'
WHERE checkpoint_id=5 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='Green', sub_en='Color of nature'
WHERE checkpoint_id=5 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='Black', sub_en='Solemn color'
WHERE checkpoint_id=5 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='Chu Van An', sub_en='Brilliant teacher'
WHERE checkpoint_id=5 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='Ly Thai To', sub_en='King who founded Hanoi'
WHERE checkpoint_id=5 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='Nguyen Trai', sub_en='Hero and scholar'
WHERE checkpoint_id=5 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='Tran Hung Dao', sub_en='Legendary general'
WHERE checkpoint_id=5 AND mission_id=5 AND option_id='d';


UPDATE mission_options SET label_en='Confucius', sub_en='The Sage'
WHERE checkpoint_id=6 AND mission_id=1 AND option_id='a';

UPDATE mission_options SET label_en='Mencius', sub_en='Second Sage of Confucianism'
WHERE checkpoint_id=6 AND mission_id=1 AND option_id='b';

UPDATE mission_options SET label_en='Le King', sub_en='Son of Heaven of the Le Dynasty'
WHERE checkpoint_id=6 AND mission_id=1 AND option_id='c';

UPDATE mission_options SET label_en='Heaven and Earth', sub_en='Sacred cosmos'
WHERE checkpoint_id=6 AND mission_id=1 AND option_id='d';

UPDATE mission_options SET label_en='2 figures', sub_en='Two sages'
WHERE checkpoint_id=6 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='3 figures', sub_en='Three sages'
WHERE checkpoint_id=6 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='4 figures', sub_en='Four Assessors'
WHERE checkpoint_id=6 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='5 figures', sub_en='Five sages'
WHERE checkpoint_id=6 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='Peach blossom', sub_en='Fresh spring'
WHERE checkpoint_id=6 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='Lotus', sub_en='Purity and nobility'
WHERE checkpoint_id=6 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='Rose', sub_en='Love and respect'
WHERE checkpoint_id=6 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='Sunflower', sub_en='Turning toward the light'
WHERE checkpoint_id=6 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='8 pillars', sub_en='Eight pillars'
WHERE checkpoint_id=6 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='12 pillars', sub_en='Twelve pillars'
WHERE checkpoint_id=6 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='16 pillars', sub_en='Sixteen pillars'
WHERE checkpoint_id=6 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='20 pillars', sub_en='Twenty pillars'
WHERE checkpoint_id=6 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='Once', sub_en='Annual grand ceremony'
WHERE checkpoint_id=6 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='Twice', sub_en='Spring and Autumn ceremonies'
WHERE checkpoint_id=6 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='Four times', sub_en='Four seasonal ceremonies'
WHERE checkpoint_id=6 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='12 times', sub_en='Monthly ceremony'
WHERE checkpoint_id=6 AND mission_id=5 AND option_id='d';


UPDATE mission_options SET label_en='939', sub_en='Ngo Quyen founded the kingdom'
WHERE checkpoint_id=7 AND mission_id=1 AND option_id='a';

UPDATE mission_options SET label_en='1010', sub_en='Ly Thai To established Thang Long'
WHERE checkpoint_id=7 AND mission_id=1 AND option_id='b';

UPDATE mission_options SET label_en='1076', sub_en='Ly Nhan Tong founded the school'
WHERE checkpoint_id=7 AND mission_id=1 AND option_id='c';

UPDATE mission_options SET label_en='1428', sub_en='Le Loi established the Le Dynasty'
WHERE checkpoint_id=7 AND mission_id=1 AND option_id='d';

UPDATE mission_options SET label_en='Princes and children of nobles', sub_en='Upper-class elite'
WHERE checkpoint_id=7 AND mission_id=2 AND option_id='a';

UPDATE mission_options SET label_en='Everyone', sub_en='Education for the people'
WHERE checkpoint_id=7 AND mission_id=2 AND option_id='b';

UPDATE mission_options SET label_en='Children of military families', sub_en='Students of military generals'
WHERE checkpoint_id=7 AND mission_id=2 AND option_id='c';

UPDATE mission_options SET label_en='Children of farmers', sub_en='Commoner students'
WHERE checkpoint_id=7 AND mission_id=2 AND option_id='d';

UPDATE mission_options SET label_en='Mathematics', sub_en='Arithmetic and geometry'
WHERE checkpoint_id=7 AND mission_id=3 AND option_id='a';

UPDATE mission_options SET label_en='Confucian studies', sub_en='The Four Books and Five Classics'
WHERE checkpoint_id=7 AND mission_id=3 AND option_id='b';

UPDATE mission_options SET label_en='Martial arts', sub_en='Military strategy and swordsmanship'
WHERE checkpoint_id=7 AND mission_id=3 AND option_id='c';

UPDATE mission_options SET label_en='Agriculture', sub_en='Farming and irrigation'
WHERE checkpoint_id=7 AND mission_id=3 AND option_id='d';

UPDATE mission_options SET label_en='Ly Thanh Tong', sub_en='Founder of the Temple of Literature in 1070'
WHERE checkpoint_id=7 AND mission_id=4 AND option_id='a';

UPDATE mission_options SET label_en='Ly Nhan Tong', sub_en='Expanded access to education'
WHERE checkpoint_id=7 AND mission_id=4 AND option_id='b';

UPDATE mission_options SET label_en='Tran Nhan Tong', sub_en='Famous Buddhist emperor'
WHERE checkpoint_id=7 AND mission_id=4 AND option_id='c';

UPDATE mission_options SET label_en='Le Thanh Tong', sub_en='Ordered the doctoral stelae'
WHERE checkpoint_id=7 AND mission_id=4 AND option_id='d';

UPDATE mission_options SET label_en='1954', sub_en='After the resistance war'
WHERE checkpoint_id=7 AND mission_id=5 AND option_id='a';

UPDATE mission_options SET label_en='1975', sub_en='National reunification'
WHERE checkpoint_id=7 AND mission_id=5 AND option_id='b';

UPDATE mission_options SET label_en='2000', sub_en='New millennium'
WHERE checkpoint_id=7 AND mission_id=5 AND option_id='c';

UPDATE mission_options SET label_en='2010', sub_en='1,000th anniversary celebration'
WHERE checkpoint_id=7 AND mission_id=5 AND option_id='d';


-- =========================================================
-- 5. HELP SECTIONS
-- =========================================================

UPDATE help_sections SET
title_en='How to Play',
content_en='Mật Mã Thăng Long is an exploration game at the Temple of Literature – Imperial Academy.

1. Choose a checkpoint on the map to begin.
2. Read the mission and observe the real surroundings.
3. Answer the puzzle to collect clues.
4. Complete 5 challenges to unlock the next checkpoint.
5. Collect all 7 stamps to complete the journey!'
WHERE id='how-to-play';

UPDATE help_sections SET
title_en='How to Use the Kit',
content_en='Your exploration kit includes:

• 📋 Paper map — use it together with the digital map.
• 🔍 Magnifying glass — use it to read small text on stone stelae.
• 📓 Notebook — record what you observe.
• ✏️ Note pen — circle important details.

Bring the kit with you during the field trip for the best experience!'
WHERE id='kit';

UPDATE help_sections SET
title_en='How to Find Checkpoints',
content_en='Each checkpoint corresponds to a real location:

• Checkpoint 01 — Van Mieu Gate (main entrance)
• Checkpoint 02 — Dai Trung Gate (second gate)
• Checkpoint 03 — Khue Van Pavilion
• Checkpoint 04 — Doctoral Stelae & Thien Quang Well
• Checkpoint 05 — Dai Thanh Gate
• Checkpoint 06 — Dai Thanh Shrine
• Checkpoint 07 — Thai Hoc Hall (the final checkpoint)

Move through the checkpoints from south to north.'
WHERE id='checkpoint';

UPDATE help_sections SET
title_en='Hints When You Are Stuck',
content_en='If you cannot find the answer:

• Press 💡 Hint — Van Dong will give you additional guidance.
• Observe the real surroundings again — the answer is always right in front of you.
• Read the Knowledge section carefully — important clues may be hidden there.

Remember: the goal is not only to answer correctly, but also to explore and learn!'
WHERE id='hints';

UPDATE help_sections SET
title_en='Support Contact',
content_en='Need more help? Contact us:

• 📧 Email: support@matmathanglong.vn
• 🌐 Website: matmathanglong.vn
• 💬 Zalo: Mật Mã Thăng Long

We are happy to support you during your exploration journey!'
WHERE id='contact';


-- =========================================================
-- 6. KIỂM TRA TOÀN BỘ CÁC CỘT EN
-- =========================================================

SELECT id, name_vi, name_en
FROM checkpoints;

SELECT checkpoint_id, id, question_vi, question_en
FROM missions
ORDER BY checkpoint_id, id;

SELECT checkpoint_id, mission_id, option_id, label_vi, label_en
FROM mission_options
ORDER BY checkpoint_id, mission_id, option_id;

SELECT id, name_vi, name_en, category_vi, category_en
FROM collectibles;

SELECT id, title_vi, title_en, description_vi, description_en
FROM achievements;

SELECT id, title_vi, title_en
FROM help_sections;




-- =========================================================
-- COLLECTIBLES — Full English update
-- Updates: name_en, category_en, found_at_en,
--          mission_ref_en, description_en
-- =========================================================

-- ── LINH VẬT (Guardians) ─────────────────────────────────
UPDATE collectibles SET
    name_en        = 'Nghe',
    category_en    = 'Guardian',
    found_at_en    = 'Van Mieu Gate',
    mission_ref_en = 'Mission 01',
    description_en = 'The Nghe is a guardian creature protecting the temple gate, symbolizing solemnity and wisdom. Its golden eyes see through all evil spirits.'
WHERE id = 'nghe';

UPDATE collectibles SET
    name_en        = 'Carp',
    category_en    = 'Guardian',
    found_at_en    = 'Well & Doctoral Stelae',
    mission_ref_en = 'Mission 04',
    description_en = 'The carp that leaps over the Dragon Gate transforms into a dragon — a symbol of perseverance and academic success. Ancient students prayed to the carp before exams.'
WHERE id = 'ca-chep';

UPDATE collectibles SET
    name_en        = 'Dragon',
    category_en    = 'Guardian',
    found_at_en    = 'Dai Trung Gate',
    mission_ref_en = 'Mission 02',
    description_en = 'The dragon is a symbol of royal power and prosperity. The image of dragons facing the moon on the gate roof signifies wisdom illuminating the world.'
WHERE id = 'rong';

UPDATE collectibles SET
    name_en        = 'Crane',
    category_en    = 'Guardian',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The crane standing on a turtle''s back symbolizes longevity and nobility. In the Confucius shrine, the pair of golden cranes represents eternal scholarship.'
WHERE id = 'hac';

UPDATE collectibles SET
    name_en        = 'Stone Turtle',
    category_en    = 'Guardian',
    found_at_en    = 'Well & Doctoral Stelae',
    mission_ref_en = 'Mission 04',
    description_en = 'Eighty-two stone turtles carry the doctoral stelae — a symbol of endurance and lasting knowledge. The turtle is the longevity creature among the Four Sacred Beasts.'
WHERE id = 'rua-da';

UPDATE collectibles SET
    name_en        = 'Qilin',
    category_en    = 'Guardian',
    found_at_en    = 'Dai Thanh Gate',
    mission_ref_en = 'Mission 05',
    description_en = 'The qilin appears when the nation has a sage. This guardian creature stands at the gate to the Confucius shrine, protecting the spirit of Confucian learning.'
WHERE id = 'ky-lan';

UPDATE collectibles SET
    name_en        = 'Phoenix',
    category_en    = 'Guardian',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The phoenix is the sacred bird of the South, symbolizing beauty, peace, and wisdom. It only lands where a sage ruler governs.'
WHERE id = 'phuong';

UPDATE collectibles SET
    name_en        = 'Lion',
    category_en    = 'Guardian',
    found_at_en    = 'Khue Van Pavilion',
    mission_ref_en = 'Mission 03',
    description_en = 'The lion is an auspicious guardian, often appearing on pillars and communal house roofs. Its scales sparkle like the Khue Star lighting the night sky.'
WHERE id = 'lan';

-- ── KIẾN TRÚC (Architecture) ─────────────────────────────
UPDATE collectibles SET
    name_en        = 'Khue Van Pavilion',
    category_en    = 'Architecture',
    found_at_en    = 'Khue Van Pavilion',
    mission_ref_en = 'Mission 03',
    description_en = 'Built in 1805, Khue Van Pavilion is a cultural symbol of Hanoi. Its round windows represent "round heaven," while the four square windows represent "square earth" — the yin-yang philosophy.'
WHERE id = 'khue-van';

UPDATE collectibles SET
    name_en        = 'Van Mieu Gate',
    category_en    = 'Architecture',
    found_at_en    = 'Van Mieu Gate',
    mission_ref_en = 'Mission 01',
    description_en = 'The three-passage Tam Quan gate of Van Mieu symbolizes the Three Powers (Heaven – Earth – Humanity). Its southern orientation welcomes the light of knowledge from the Khue Star.'
WHERE id = 'van-mieu-mon';

UPDATE collectibles SET
    name_en        = 'Doctoral Stelae',
    category_en    = 'Architecture',
    found_at_en    = 'Well & Doctoral Stelae',
    mission_ref_en = 'Mission 04',
    description_en = 'Eighty-two stone stelae inscribed with the names of 1,307 doctoral laureates from 1442–1779. Each stele is a page of history about those who overcame the intellectual challenges of their era.'
WHERE id = 'bia-tien-si';

UPDATE collectibles SET
    name_en        = 'Twin Pavilion',
    category_en    = 'Architecture',
    found_at_en    = 'Dai Trung Gate',
    mission_ref_en = 'Mission 02',
    description_en = 'The distinctive two-tier curved roof of Dai Trung Gate reflects Le dynasty architectural style. Each roof corner is shaped like a carp''s tail curving up to the sky.'
WHERE id = 'gac-doi';

UPDATE collectibles SET
    name_en        = 'Dai Thanh Gate',
    category_en    = 'Architecture',
    found_at_en    = 'Dai Thanh Gate',
    mission_ref_en = 'Mission 05',
    description_en = 'The gate leading to the Confucius shrine, with doors painted in enduring vermilion. In the past, only officials and outstanding students were permitted to pass through this gate.'
WHERE id = 'dai-thanh-mon';

UPDATE collectibles SET
    name_en        = 'Thai Hoc Hall',
    category_en    = 'Architecture',
    found_at_en    = 'Thai Hoc Hall',
    mission_ref_en = 'Mission 07',
    description_en = 'Founded in 1076 under King Ly Nhan Tong, the Imperial Academy was Vietnam''s first university. It nurtured the finest minds of the nation.'
WHERE id = 'nha-thai-hoc';

UPDATE collectibles SET
    name_en        = 'Thien Quang Well',
    category_en    = 'Architecture',
    found_at_en    = 'Well & Doctoral Stelae',
    mission_ref_en = 'Mission 04',
    description_en = '"Thien Quang" means heavenly light. The well''s calm surface reflects the sky and the Khue Star — a symbol of wisdom illuminating the path of learning.'
WHERE id = 'gieng-thien';

UPDATE collectibles SET
    name_en        = 'Dai Thanh Shrine',
    category_en    = 'Architecture',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The center of the Temple of Literature, where Confucius and the Four Assessors are worshipped. Sixteen intricately carved lim-wood pillars support a thousand-year-old tiled roof.'
WHERE id = 'dien-dai';

-- ── BIỂU TƯỢNG (Symbols) ─────────────────────────────────
UPDATE collectibles SET
    name_en        = 'Scroll',
    category_en    = 'Symbol',
    found_at_en    = 'Van Mieu Gate',
    mission_ref_en = 'Mission 01',
    description_en = 'The scroll is a symbol of scholarship and knowledge. Throughout the Temple of Literature, scroll motifs appear on every architectural element as a reminder of its educational mission.'
WHERE id = 'cuon-thu';

UPDATE collectibles SET
    name_en        = 'Khue Star',
    category_en    = 'Symbol',
    found_at_en    = 'Khue Van Pavilion',
    mission_ref_en = 'Mission 03',
    description_en = 'The Khue Star (α Virginis) represents literature and scholarship in East Asian astronomy. Khue Van Pavilion was named in honor of this star.'
WHERE id = 'sao-khue';

UPDATE collectibles SET
    name_en        = 'Dong Son Drum',
    category_en    = 'Symbol',
    found_at_en    = 'Thai Hoc Hall',
    mission_ref_en = 'Mission 07',
    description_en = 'The Dong Son bronze drum is the oldest symbol of Vietnamese civilization. Its sound echoes during commemorative festivals at the Temple of Literature.'
WHERE id = 'trong-dong';

UPDATE collectibles SET
    name_en        = 'Apricot Blossom',
    category_en    = 'Symbol',
    found_at_en    = 'Khue Van Pavilion',
    mission_ref_en = 'Mission 03',
    description_en = 'The apricot blossom blooming in early spring symbolizes the purity and resilience of a noble person. Ancient students planted apricot trees in the Temple grounds to remember virtue.'
WHERE id = 'hoa-mai';

UPDATE collectibles SET
    name_en        = 'Octagon',
    category_en    = 'Symbol',
    found_at_en    = 'Khue Van Pavilion',
    mission_ref_en = 'Mission 03',
    description_en = 'The octagonal shape in Khue Van Pavilion''s architecture represents the Bagua — the eight cosmic trigrams of Eastern philosophy, embodying harmony between heaven and earth.'
WHERE id = 'bat-giac';

UPDATE collectibles SET
    name_en        = 'Vermilion Seal',
    category_en    = 'Symbol',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The red seal symbolizes confirmation and the authority of knowledge. Doctoral diplomas were stamped with vermilion — the highest certification under the feudal system.'
WHERE id = 'trieu-son';

UPDATE collectibles SET
    name_en        = 'Bodhi Leaf',
    category_en    = 'Symbol',
    found_at_en    = 'Thai Hoc Hall',
    mission_ref_en = 'Mission 07',
    description_en = 'The bodhi tree is where the Buddha attained enlightenment. But in the Temple of Literature — where Buddhism, Confucianism, and Taoism blend — the bodhi leaf represents enlightenment through scholarship.'
WHERE id = 'la-bo-de';

UPDATE collectibles SET
    name_en        = 'Golden Seal',
    category_en    = 'Symbol',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The golden seal is a royal treasure, awarded only to the top laureate. In the history of 38 examinations, only 13 people received this highest honor.'
WHERE id = 'an-vang';

-- ── VẬT PHẨM (Items) ─────────────────────────────────────
UPDATE collectibles SET
    name_en        = 'Gourd Bottle',
    category_en    = 'Item',
    found_at_en    = 'Khue Van Pavilion',
    mission_ref_en = 'Mission 03',
    description_en = 'The gourd bottle is an object of sages and physicians. In the Temple of Literature, gourd motifs on architectural elements are wishes for students'' longevity.'
WHERE id = 'binh-ho-lo';

UPDATE collectibles SET
    name_en        = 'Lotus Bud',
    category_en    = 'Item',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The lotus grows from mud without smelling of mud — a symbol of the noble person. Offering lotus to Confucius''s altar is a prayer for a pure soul.'
WHERE id = 'bup-sen';

UPDATE collectibles SET
    name_en        = 'Bell',
    category_en    = 'Item',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'The Temple of Literature bell rings each morning as a reminder for students to begin their studies. Twice a year, its sound resonates during the grand Confucius ceremonies.'
WHERE id = 'chuong';

UPDATE collectibles SET
    name_en        = 'Lantern',
    category_en    = 'Item',
    found_at_en    = 'Dai Trung Gate',
    mission_ref_en = 'Mission 02',
    description_en = 'Red lanterns hung before the temple gate light the path of learning. In the past, poor students lit lanterns to study late into the night preparing for provincial exams.'
WHERE id = 'den-long';

UPDATE collectibles SET
    name_en        = 'Chinese Ink',
    category_en    = 'Item',
    found_at_en    = 'Thai Hoc Hall',
    mission_ref_en = 'Mission 07',
    description_en = 'Chinese ink, ground from soot and animal glue, was used to write on dó paper. Every stroke of an Imperial Academy student''s brush carried years of diligent practice.'
WHERE id = 'muc-tau';

UPDATE collectibles SET
    name_en        = 'Inkstone',
    category_en    = 'Item',
    found_at_en    = 'Thai Hoc Hall',
    mission_ref_en = 'Mission 07',
    description_en = 'The stone inkstone was a student''s constant companion. Polished black stones from the Red River were chosen for crafting inkstones, used to grind ink from dawn to dusk.'
WHERE id = 'nghien';

UPDATE collectibles SET
    name_en        = 'Calligraphy Brush',
    category_en    = 'Item',
    found_at_en    = 'Van Mieu Gate',
    mission_ref_en = 'Mission 01',
    description_en = 'The calligraphy brush is a tool for recording knowledge. At the spring "first stroke" ceremony at Van Mieu, students wrote the year''s first characters with a brush for good fortune.'
WHERE id = 'but-long';

UPDATE collectibles SET
    name_en        = 'Agarwood',
    category_en    = 'Item',
    found_at_en    = 'Dai Thanh Shrine',
    mission_ref_en = 'Mission 06',
    description_en = 'Agarwood smoke rising from the censer in Dai Thanh Shrine carries prayers to Confucius. The scent of agarwood evokes the solemn atmosphere of a thousand years.'
WHERE id = 'tram-huong';

UPDATE collectibles SET
    name_en        = 'Conical Hat',
    category_en    = 'Item',
    found_at_en    = 'Van Mieu Gate',
    mission_ref_en = 'Mission 01',
    description_en = 'The white conical hat of Van Dong — the guide who leads students to explore the Temple of Literature. Each hat is woven from palm leaves, light yet durable, shielding against sun and rain along the path of learning.'
WHERE id = 'non-la';

UPDATE collectibles SET
    name_en        = 'Book of Classics',
    category_en    = 'Item',
    found_at_en    = 'Thai Hoc Hall',
    mission_ref_en = 'Mission 07',
    description_en = 'The Analects — Confucius''s philosophical masterpiece — was taught at the Imperial Academy for 700 years. "Learning without thinking is useless."'
WHERE id = 'cuon-kinh';