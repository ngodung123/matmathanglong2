CREATE DATABASE IF NOT EXISTS `mat_ma_thang_long` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mat_ma_thang_long`;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS mission_options;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS checkpoints;
DROP TABLE IF EXISTS collectibles;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS help_sections;
DROP TABLE IF EXISTS site_positions;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE checkpoints (
  id INT PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NULL,
  short_description_vi TEXT,
  short_description_en TEXT,
  stamp_name_vi VARCHAR(255),
  stamp_name_en VARCHAR(255),
  stamp_char VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE missions (
  checkpoint_id INT NOT NULL,
  id INT NOT NULL,
  observation_tag_vi VARCHAR(100),
  observation_tag_en VARCHAR(100),
  van_dong_dialogue_vi TEXT,
  van_dong_dialogue_en TEXT,
  observation_instruction_vi TEXT,
  observation_instruction_en TEXT,
  put_phone_down_vi TEXT,
  put_phone_down_en TEXT,
  question_vi TEXT,
  question_en TEXT,
  hint_vi TEXT,
  hint_en TEXT,
  collectible_emoji VARCHAR(20),
  collectible_name_vi VARCHAR(255),
  collectible_name_en VARCHAR(255),
  collectible_rarity ENUM('common','rare','legendary'),
  collectible_flavour_vi TEXT,
  collectible_flavour_en TEXT,
  xp INT NOT NULL,
  clue_unlocked_vi TEXT,
  clue_unlocked_en TEXT,
  PRIMARY KEY (checkpoint_id, id),
  CONSTRAINT fk_mission_checkpoint FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE mission_options (
  checkpoint_id INT NOT NULL,
  mission_id INT NOT NULL,
  option_id VARCHAR(50) NOT NULL,
  emoji VARCHAR(20),
  label_vi VARCHAR(255),
  label_en VARCHAR(255),
  sub_vi VARCHAR(255),
  sub_en VARCHAR(255),
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (checkpoint_id, mission_id, option_id),
  CONSTRAINT fk_option_mission FOREIGN KEY (checkpoint_id, mission_id) REFERENCES missions(checkpoint_id, id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE collectibles (
  id VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255),
  name_en VARCHAR(255),
  emoji VARCHAR(20),
  category_vi VARCHAR(100),
  category_en VARCHAR(100),
  rarity ENUM('common','rare','legendary'),
  found_at_vi VARCHAR(255),
  found_at_en VARCHAR(255),
  mission_ref_vi VARCHAR(100),
  mission_ref_en VARCHAR(100),
  description_vi TEXT,
  description_en TEXT,
  default_collected BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE achievements (
  id VARCHAR(100) PRIMARY KEY,
  emoji VARCHAR(20),
  title_vi VARCHAR(255),
  title_en VARCHAR(255),
  description_vi TEXT,
  description_en TEXT,
  bg_from VARCHAR(20),
  bg_to VARCHAR(20),
  border_color VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE help_sections (
  id VARCHAR(100) PRIMARY KEY,
  icon VARCHAR(20),
  title_vi VARCHAR(255),
  title_en VARCHAR(255),
  content_vi TEXT,
  content_en TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE site_positions (
  checkpoint_id INT PRIMARY KEY,
  x INT NOT NULL,
  y INT NOT NULL,
  CONSTRAINT fk_position_checkpoint FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO checkpoints VALUES (1,'Văn Miếu Môn',NULL,'Ranh giới giữa chốn phàm trần và không gian học thuật.',NULL,'Dấu Văn Miếu Môn',NULL,'文');
INSERT INTO checkpoints VALUES (2,'Đại Trung Môn',NULL,'Cổng thứ hai ngăn cách nội viện và không gian linh thiêng phía trong.',NULL,'Dấu Đại Trung',NULL,'中');
INSERT INTO checkpoints VALUES (3,'Khuê Văn Các',NULL,'Lầu văn chương — biểu tượng của Hà Nội và tinh hoa học vấn Việt Nam.',NULL,'Dấu Khuê Văn',NULL,'奎');
INSERT INTO checkpoints VALUES (4,'Giếng Thiên Quang & Bia Tiến Sĩ',NULL,'Nơi lưu danh 1307 tiến sĩ qua các triều đại — hồn thiêng học vấn ngàn năm.',NULL,'Dấu Bia Tiến Sĩ',NULL,'碑');
INSERT INTO checkpoints VALUES (5,'Đại Thành Môn',NULL,'Cánh cổng thiêng dẫn vào không gian thờ phụng Đức Khổng Tử.',NULL,'Dấu Đại Thành',NULL,'成');
INSERT INTO checkpoints VALUES (6,'Điện Đại Thành',NULL,'Trung tâm linh thiêng nhất — nơi thờ Đức Khổng Tử và Tứ Phối.',NULL,'Dấu Điện Thờ',NULL,'殿');
INSERT INTO checkpoints VALUES (7,'Nhà Thái Học',NULL,'Nơi tái hiện trường đại học đầu tiên của Việt Nam — Quốc Tử Giám nghìn năm trước.',NULL,'Dấu Đại Học Sĩ',NULL,'學');
INSERT INTO missions VALUES ('1','1','QUAN SÁT',NULL,'Để bước qua ranh giới phàm trần vào chốn thiêng liêng này, đệ phải có con mắt tinh tường.',NULL,'Hãy ngước nhìn lên đỉnh của hai cột trụ biểu cao phía trước.',NULL,'Đặt điện thoại xuống và quan sát thật kỹ — vật trang trí trên đỉnh cột có hình gì?',NULL,'Con linh thú nào đang đứng uy nghiêm trên đỉnh của hai cột trụ biểu?',NULL,'Linh vật thuần Việt, kết hợp giữa chó và sư tử. Thường ngồi xổm, mặt hướng ra ngoài.',NULL,'🦁','Nghê Trụ Biểu',NULL,'legendary','Nghê là linh vật thuần Việt, hiện thân của sự canh giữ và trí tuệ. Khác với kỳ lân ngoại lai, Nghê mang đặc trưng văn hóa bản địa sâu sắc.',NULL,'100','Nghê canh giữ tri thức → Tìm Nghê trong khu nội viện!',NULL);
INSERT INTO mission_options VALUES ('1','1','nghe','🦁','Nghê',NULL,'Linh vật thuần Việt',NULL,'1');
INSERT INTO mission_options VALUES ('1','1','rong','🐉','Rồng',NULL,'Long – linh vật cao quý',NULL,'0');
INSERT INTO mission_options VALUES ('1','1','kylan','🦄','Kỳ lân',NULL,'Linh vật tứ linh',NULL,'0');
INSERT INTO mission_options VALUES ('1','1','phuong','🦅','Phượng hoàng',NULL,'Phụng – chim thần',NULL,'0');
INSERT INTO missions VALUES ('1','2','QUAN SÁT',NULL,'Tam quan — ba lối đi tượng trưng cho ba con đường dẫn đến tri thức. Hãy đếm thật kỹ.',NULL,'Đứng trước cổng và đếm số lối đi của Văn Miếu Môn.',NULL,'Hãy ngước nhìn thẳng vào cổng — đếm các khoang cửa từ trái sang phải.',NULL,'Văn Miếu Môn có tổng cộng bao nhiêu lối đi (khoang cửa)?',NULL,'"Tam" trong "Tam quan" chính là từ chỉ số lượng lối đi.',NULL,'🚪','Tam Quan Bí Kíp',NULL,'common','Tam quan với ba lối: lối giữa dành cho vua, hai lối bên cho quan và dân. Tầng lớp xã hội được phân định ngay từ bước chân đầu tiên.',NULL,'80','Ba lối đi → Ba tầng xã hội xưa → Ai đi lối nào?',NULL);
INSERT INTO mission_options VALUES ('1','2','a','1️⃣','1 lối',NULL,'Độc đạo',NULL,'0');
INSERT INTO mission_options VALUES ('1','2','b','2️⃣','2 lối',NULL,'Song song',NULL,'0');
INSERT INTO mission_options VALUES ('1','2','c','3️⃣','3 lối',NULL,'Tam quan',NULL,'1');
INSERT INTO mission_options VALUES ('1','2','d','5️⃣','5 lối',NULL,'Ngũ môn',NULL,'0');
INSERT INTO missions VALUES ('1','3','QUAN SÁT',NULL,'Màu sắc trong kiến trúc Việt xưa không phải ngẫu nhiên. Mỗi màu mang một ý nghĩa thiêng liêng.',NULL,'Quan sát màu sơn của các cột và tường chính của Văn Miếu Môn.',NULL,'Bước lùi một chút để thấy toàn bộ cổng — màu chủ đạo là màu gì?',NULL,'Màu sơn chủ đạo của Văn Miếu Môn là màu gì?',NULL,'Màu này tượng trưng cho sự may mắn, quyền lực và bảo vệ trong văn hóa Á Đông.',NULL,'🎨','Bí Kíp Chu Sa',NULL,'common','Màu đỏ son (chu sa) được dùng khắp Văn Miếu để xua đuổi tà khí và thể hiện sự uy nghiêm của chốn học vấn thiêng liêng.',NULL,'80','Đỏ son → màu của tri thức và quyền lực → tìm thêm màu này!',NULL);
INSERT INTO mission_options VALUES ('1','3','a','🔴','Đỏ son',NULL,'Chu sa – màu linh thiêng',NULL,'1');
INSERT INTO mission_options VALUES ('1','3','b','🟡','Vàng',NULL,'Màu của hoàng gia',NULL,'0');
INSERT INTO mission_options VALUES ('1','3','c','🟤','Nâu gỗ',NULL,'Màu gỗ tự nhiên',NULL,'0');
INSERT INTO mission_options VALUES ('1','3','d','⚫','Đen',NULL,'Màu trang nghiêm',NULL,'0');
INSERT INTO missions VALUES ('1','4','KIẾN THỨC',NULL,'Hướng của công trình không phải ngẫu nhiên. Người xưa chọn hướng theo phong thủy và thiên văn.',NULL,'Dùng la bàn hoặc quan sát vị trí mặt trời — Văn Miếu Môn quay mặt về hướng nào?',NULL,'Đứng trước cổng, cảm nhận ánh nắng và xác định phương hướng.',NULL,'Văn Miếu – Quốc Tử Giám quay mặt về hướng nào?',NULL,'Theo phong thủy cổ đại, hướng này tượng trưng cho ánh sáng tri thức, đối nghịch với hướng Bắc tối tăm.',NULL,'🧭','La Bàn Phong Thủy',NULL,'rare','Hướng Nam là hướng của ánh sáng, trí tuệ và phồn thịnh. Các công trình học vấn thường quay về hướng này theo truyền thống phong thủy Á Đông.',NULL,'120','Hướng Nam → Ánh sáng tri thức → Tìm tấm bia hướng Nam!',NULL);
INSERT INTO mission_options VALUES ('1','4','a','⬆️','Hướng Bắc',NULL,'Hướng phong thủy hoàng gia',NULL,'0');
INSERT INTO mission_options VALUES ('1','4','b','⬇️','Hướng Nam',NULL,'Hướng học vấn và minh trí',NULL,'1');
INSERT INTO mission_options VALUES ('1','4','c','⬅️','Hướng Tây',NULL,'Hướng lặn của mặt trời',NULL,'0');
INSERT INTO mission_options VALUES ('1','4','d','➡️','Hướng Đông',NULL,'Hướng mọc của mặt trời',NULL,'0');
INSERT INTO missions VALUES ('1','5','QUAN SÁT',NULL,'Hoa này không chỉ đẹp — nó là biểu tượng của sự thanh cao, vươn lên từ bùn đất mà không nhiễm bùn đất.',NULL,'Nhìn quanh chân các cột và bờ tường — loại hoa nào được chạm khắc trang trí?',NULL,'Hãy cúi xuống nhìn phần chân cột — hoa gì đang khắc ở đó?',NULL,'Loại hoa nào được chạm khắc trang trí ở chân các cột Văn Miếu Môn?',NULL,'Loài hoa này mọc từ bùn nhưng vẫn thơm ngát — biểu tượng của người quân tử vượt lên hoàn cảnh.',NULL,'🪷','Hoa Sen Văn Miếu',NULL,'rare','Hoa sen là biểu tượng của Phật giáo và Nho giáo Việt Nam — vẻ đẹp thanh cao không bị ô nhiễm bởi bùn đất, như người học trò giữ vững đạo đức trong mọi hoàn cảnh.',NULL,'100','Sen nở → Học trò → Tìm sen trong khu Hồ Thiên Quang!',NULL);
INSERT INTO mission_options VALUES ('1','5','a','🌸','Hoa đào',NULL,'Biểu tượng mùa xuân',NULL,'0');
INSERT INTO mission_options VALUES ('1','5','b','🌺','Hoa sen',NULL,'Thanh cao, thuần khiết',NULL,'1');
INSERT INTO mission_options VALUES ('1','5','c','🌼','Hoa cúc',NULL,'Tứ quý thanh cao',NULL,'0');
INSERT INTO mission_options VALUES ('1','5','d','🌹','Hoa hồng',NULL,'Vẻ đẹp quý phái',NULL,'0');
INSERT INTO missions VALUES ('2','1','QUAN SÁT',NULL,'Đây là ranh giới thứ hai. Mỗi bước tiến vào sâu hơn là một bước gần hơn với đỉnh tri thức.',NULL,'Quan sát mái của Đại Trung Môn từ bên ngoài — có bao nhiêu tầng mái?',NULL,'Bước ra xa và nhìn lên — đếm từng tầng mái chồng lên nhau.',NULL,'Mái của Đại Trung Môn có mấy tầng?',NULL,'"Trùng thiềm điệp ốc" là phong cách 2 tầng mái phổ biến trong kiến trúc cung đình Việt.',NULL,'🏯','Mảnh Ngói Cổ',NULL,'common','Ngói mũi hài hai lớp là đặc trưng của kiến trúc cổ Việt Nam — kiểu dáng vừa đẹp vừa chống mưa nắng hiệu quả trong khí hậu nhiệt đới.',NULL,'80','Mái đôi → Hai thế giới → Trong và ngoài.',NULL);
INSERT INTO mission_options VALUES ('2','1','a','🏠','1 tầng',NULL,'Đơn giản, thanh thoát',NULL,'0');
INSERT INTO mission_options VALUES ('2','1','b','🏯','2 tầng',NULL,'Trùng thiềm điệp ốc',NULL,'1');
INSERT INTO mission_options VALUES ('2','1','c','🗼','3 tầng',NULL,'Tam tầng uy nghi',NULL,'0');
INSERT INTO mission_options VALUES ('2','1','d','🏛️','4 tầng',NULL,'Tứ tầng bệ vệ',NULL,'0');
INSERT INTO missions VALUES ('2','2','QUAN SÁT',NULL,'Đỉnh nóc công trình thường được trang trí bằng linh vật đặc biệt — một biểu tượng quyền năng của trời đất.',NULL,'Ngước nhìn lên đỉnh nóc của Đại Trung Môn — hình ảnh gì đang trang trí ở đó?',NULL,'Tìm điểm đứng thoáng, nhìn thẳng lên nóc — hình dáng gì ở giữa đỉnh mái?',NULL,'Hình trang trí đặc trưng trên đỉnh nóc của Đại Trung Môn là gì?',NULL,'"Lưỡng long" = hai con rồng. "Chầu nguyệt" = hướng về mặt trăng. Hình ảnh này tượng trưng cho sự hài hòa âm dương.',NULL,'🌙','Lưỡng Long Ngọc Bội',NULL,'rare','Hình lưỡng long chầu nguyệt tượng trưng cho sự cân bằng giữa âm và dương, trời và đất. Đây là motif phổ biến nhất trong kiến trúc hoàng gia và học thuật Việt Nam.',NULL,'120','Lưỡng long → Âm Dương → Tìm biểu tượng này ở Điện Đại Thành!',NULL);
INSERT INTO mission_options VALUES ('2','2','a','🐉','Lưỡng long chầu nguyệt',NULL,'Hai rồng chầu mặt trăng',NULL,'1');
INSERT INTO mission_options VALUES ('2','2','b','🦅','Phụng hoàng',NULL,'Chim thần đứng một mình',NULL,'0');
INSERT INTO mission_options VALUES ('2','2','c','⭐','Hoa văn sao',NULL,'Trang trí hình học',NULL,'0');
INSERT INTO mission_options VALUES ('2','2','d','🔱','Bình hồ lô',NULL,'Bình thuốc tiên',NULL,'0');
INSERT INTO missions VALUES ('2','3','QUAN SÁT',NULL,'Gỗ dùng làm cánh cửa ở đây không phải gỗ thường. Người xưa chọn rất kỹ.',NULL,'Lại gần và quan sát cánh cửa của Đại Trung Môn — gõ nhẹ và chú ý màu sắc, độ cứng.',NULL,'Đặt tay lên cánh cửa — cảm nhận chất liệu và quan sát màu sắc của gỗ.',NULL,'Cánh cửa của Đại Trung Môn được làm chủ yếu từ loại gỗ nào?',NULL,'Loại gỗ cứng nhất Việt Nam, có thể tồn tại hàng trăm năm dưới mưa nắng.',NULL,'🪵','Mảnh Gỗ Lim Cổ',NULL,'common','Gỗ lim (Erythrophleum fordii) là loại gỗ cứng nhất Đông Nam Á, có thể tồn tại trên 500 năm nếu được bảo dưỡng đúng cách. Người thợ xưa dùng gỗ này cho mọi công trình trọng yếu.',NULL,'80','Gỗ lim → Bền vững → Như tri thức truyền đời.',NULL);
INSERT INTO mission_options VALUES ('2','3','a','🌲','Gỗ lim',NULL,'Cứng, bền, chống mối mọt',NULL,'1');
INSERT INTO mission_options VALUES ('2','3','b','🎋','Gỗ tre',NULL,'Nhẹ, dẻo, dễ uốn',NULL,'0');
INSERT INTO mission_options VALUES ('2','3','c','🌴','Gỗ mít',NULL,'Thơm, màu vàng',NULL,'0');
INSERT INTO mission_options VALUES ('2','3','d','🪵','Gỗ thông',NULL,'Nhẹ, dễ chế tác',NULL,'0');
INSERT INTO missions VALUES ('2','4','KHÁM PHÁ',NULL,'Văn Miếu được chia thành năm khu. Mỗi cổng đánh dấu ranh giới giữa các khu thiêng liêng khác nhau.',NULL,'Đứng trước Đại Trung Môn và nhìn xuyên qua cổng — khu vực nào hiện ra phía trong?',NULL,'Nhìn qua cổng mở — những gì đầu tiên bạn thấy ở phía trong?',NULL,'Đi qua Đại Trung Môn, khu vực nào hiện ra ngay phía trước?',NULL,'Khu vực thứ ba của Văn Miếu — nơi có tấm gương phản chiếu ánh sáng trời và 82 tấm bia.',NULL,'💧','Nước Thiên Quang',NULL,'rare','Hồ Thiên Quang Tỉnh ("Giếng ánh sáng trời") nằm ở trung tâm khu vực bia tiến sĩ. Mặt hồ phẳng lặng như gương, phản chiếu bầu trời và Khuê Văn Các.',NULL,'100','Hồ Thiên Quang → Soi gương → Ai được phản chiếu?',NULL);
INSERT INTO mission_options VALUES ('2','4','a','🏛️','Điện Đại Thành',NULL,'Khu thờ chính',NULL,'0');
INSERT INTO mission_options VALUES ('2','4','b','💧','Hồ Thiên Quang',NULL,'Hồ nước thiêng',NULL,'1');
INSERT INTO mission_options VALUES ('2','4','c','📚','Nhà Thái Học',NULL,'Khu học tập',NULL,'0');
INSERT INTO mission_options VALUES ('2','4','d','🌳','Vườn cây cổ thụ',NULL,'Không gian tĩnh lặng',NULL,'0');
INSERT INTO missions VALUES ('2','5','KIẾN THỨC',NULL,'Chữ "Trung" trên cổng này mang một nghĩa triết học sâu sắc trong Nho giáo.',NULL,'Đọc chữ Hán khắc trên biển hiệu của cổng.',NULL,'Nhìn lên biển tên của cổng — ba chữ Hán đó có nghĩa gì?',NULL,'"Đại Trung" trong Nho học có nghĩa là gì?',NULL,'Trong Nho học, "Trung" không có nghĩa là "giữa" về vị trí — mà là chuẩn mực đạo đức không thiên lệch.',NULL,'⚖️','Kinh Trung Dung',NULL,'legendary','"Trung dung" là một trong Tứ Thư quan trọng nhất của Nho giáo — dạy con người sống không thái quá, không bất cập, luôn giữ trạng thái hài hòa hoàn hảo.',NULL,'150','Trung dung → Hài hòa → Tìm biểu tượng cân bằng trong Điện Đại Thành!',NULL);
INSERT INTO mission_options VALUES ('2','5','a','⚖️','Đức hạnh trung hòa',NULL,'Đạo trung dung chuẩn mực',NULL,'1');
INSERT INTO mission_options VALUES ('2','5','b','🎯','Cổng ở giữa',NULL,'Vị trí trung tâm',NULL,'0');
INSERT INTO mission_options VALUES ('2','5','c','🏆','Thành tích lớn',NULL,'Đại thành tựu',NULL,'0');
INSERT INTO mission_options VALUES ('2','5','d','📖','Sách lớn',NULL,'Kho tri thức',NULL,'0');
INSERT INTO missions VALUES ('3','1','QUAN SÁT',NULL,'Khuê Văn Các — viên ngọc của Văn Miếu. Cửa sổ của nó ẩn chứa triết lý về vũ trụ.',NULL,'Nhìn lên tầng lầu của Khuê Văn Các — cửa sổ có hình dạng gì?',NULL,'Bước ra xa, ngước nhìn — hình dạng của bốn cửa sổ trên lầu là gì?',NULL,'Cửa sổ tầng lầu của Khuê Văn Các có hình dạng đặc biệt gì?',NULL,'Hình dạng này tượng trưng cho bầu trời, đối lập với nền đất vuông phía dưới — triết lý thiên-địa.',NULL,'⭕','Vòng Tròn Thiên Mệnh',NULL,'rare','Cửa sổ tròn của Khuê Văn Các tượng trưng cho bầu trời — "thiên tròn địa vuông". Ánh sáng lọt qua tạo những vòng tròn vàng óng chiếu xuống sàn đá.',NULL,'100','Trời tròn đất vuông → Triết lý cổ đại → Tìm trong kiến trúc Điện!',NULL);
INSERT INTO mission_options VALUES ('3','1','a','⬜','Hình vuông',NULL,'Tượng trưng cho đất',NULL,'0');
INSERT INTO mission_options VALUES ('3','1','b','🔵','Hình tròn',NULL,'Tượng trưng cho trời',NULL,'1');
INSERT INTO mission_options VALUES ('3','1','c','🔷','Hình thoi',NULL,'Tứ phương tám hướng',NULL,'0');
INSERT INTO mission_options VALUES ('3','1','d','⬡','Hình lục giác',NULL,'Tổ ong trí tuệ',NULL,'0');
INSERT INTO missions VALUES ('3','2','KIẾN THỨC',NULL,'Năm khắc trên đá nền lầu này ghi lại thời điểm vua Gia Long ban lệnh xây dựng công trình.',NULL,'Tìm tấm biển hoặc chữ khắc ghi năm xây dựng Khuê Văn Các.',NULL,'Đi vòng quanh lầu và tìm bảng ghi thông tin lịch sử — năm xây dựng là năm nào?',NULL,'Khuê Văn Các được xây dựng vào năm nào?',NULL,'Đây là năm thứ 4 niên hiệu Gia Long — vua đầu tiên của triều Nguyễn, người thống nhất Việt Nam.',NULL,'📜','Chiếu Chỉ Gia Long',NULL,'rare','Năm 1805, vua Gia Long ban lệnh xây Khuê Văn Các để tôn vinh học vấn. Công trình mất 2 năm hoàn thành và trở thành biểu tượng của Hà Nội đến tận ngày nay.',NULL,'100','1805 → Triều Nguyễn → Tìm thêm dấu vết thời kỳ này!',NULL);
INSERT INTO mission_options VALUES ('3','2','a','📅','1070',NULL,'Thời Lý Thánh Tông',NULL,'0');
INSERT INTO mission_options VALUES ('3','2','b','📅','1484',NULL,'Thời Lê Thánh Tông',NULL,'0');
INSERT INTO mission_options VALUES ('3','2','c','📅','1805',NULL,'Thời Gia Long',NULL,'1');
INSERT INTO mission_options VALUES ('3','2','d','📅','1945',NULL,'Thời hiện đại',NULL,'0');
INSERT INTO missions VALUES ('3','3','KIẾN THỨC',NULL,'"Khuê" là tên một ngôi sao đặc biệt — ngôi sao của những người cầm bút và sách vở.',NULL,'Nhìn vào tấm biển tên lầu — chữ "Khuê" tương ứng với ngôi sao nào trong thiên văn?',NULL,'Đọc thông tin giới thiệu gần Khuê Văn Các — ngôi sao Khuê thuộc chòm sao nào?',NULL,'Sao Khuê (奎) là biểu tượng của điều gì trong thiên văn Á Đông?',NULL,'Trong "Nhị thập bát tú" (28 chòm sao), sao này chủ quản chữ nghĩa, văn học và khoa cử.',NULL,'⭐','Sao Khuê Bản Đồ',NULL,'legendary','Sao Khuê (奎宿) thuộc nhóm Bạch Hổ phương Tây trong thiên văn học cổ. Người xưa tin ngôi sao này soi sáng cho những người học giỏi và đỗ đạt.',NULL,'150','Sao Khuê → Văn chương → Tìm bài thơ khắc trong khu nội viện!',NULL);
INSERT INTO mission_options VALUES ('3','3','a','📖','Văn chương học vấn',NULL,'Chủ tinh của kẻ sĩ',NULL,'1');
INSERT INTO mission_options VALUES ('3','3','b','⚔️','Chiến tranh',NULL,'Sao của tướng lĩnh',NULL,'0');
INSERT INTO mission_options VALUES ('3','3','c','💰','Tài lộc',NULL,'Sao của thương nhân',NULL,'0');
INSERT INTO mission_options VALUES ('3','3','d','👑','Đế vương',NULL,'Sao của vua chúa',NULL,'0');
INSERT INTO missions VALUES ('3','4','QUAN SÁT',NULL,'Nền lầu đứng vững trên những cột trụ đặc biệt — hãy quan sát kỹ chất liệu.',NULL,'Đến gần và sờ tay vào các cột đỡ tầng lầu — chất liệu nào được dùng?',NULL,'Sờ nhẹ vào cột — gỗ hay đá? Quan sát màu sắc và kết cấu.',NULL,'Khuê Văn Các đứng trên bao nhiêu cột đỡ?',NULL,'4 cột gạch vuông bên dưới + 4 cột gỗ tròn bên trên = tổng cộng bao nhiêu?',NULL,'🏛️','Mảnh Cột Gạch Cổ',NULL,'common','Khuê Văn Các được xây trên 8 cột: 4 cột gạch hình vuông (tượng trưng đất) và 4 cột gỗ hình tròn (tượng trưng trời). Triết học "thiên tròn địa vuông" hiện diện trong từng chi tiết.',NULL,'80','8 cột → 4+4 → Trời và đất hợp nhất!',NULL);
INSERT INTO mission_options VALUES ('3','4','a','4️⃣','4 cột',NULL,'Tứ trụ thiên hạ',NULL,'0');
INSERT INTO mission_options VALUES ('3','4','b','6️⃣','6 cột',NULL,'Lục giác hoàn hảo',NULL,'0');
INSERT INTO mission_options VALUES ('3','4','c','8️⃣','8 cột',NULL,'Bát giác vũ trụ',NULL,'1');
INSERT INTO mission_options VALUES ('3','4','d','🔟','10 cột',NULL,'Thập toàn thập mỹ',NULL,'0');
INSERT INTO missions VALUES ('3','5','QUAN SÁT',NULL,'Nhìn xuống phía dưới Khuê Văn Các — mặt hồ phẳng lặng như tấm gương thiên nhiên.',NULL,'Từ trên lầu nhìn xuống — Khuê Văn Các phản chiếu xuống mặt nước nào?',NULL,'Đứng trên lầu, nhìn xuống phía trước — bóng lầu in trên mặt nước nào?',NULL,'Bóng của Khuê Văn Các phản chiếu xuống hồ nào?',NULL,'"Thiên Quang" nghĩa là ánh sáng trời — tên của hồ nước ngay dưới lầu này.',NULL,'🔮','Gương Thiên Quang',NULL,'legendary','Hồ Thiên Quang được ví như "gương của trời" — phản chiếu Khuê Văn Các và bầu trời. Các tiến sĩ xưa thường dừng lại ngắm bóng mình dưới hồ trước khi vào thi.',NULL,'150','Gương nước → Phản chiếu → Ai nhìn thấy chính mình?',NULL);
INSERT INTO mission_options VALUES ('3','5','a','🏞️','Hồ Tây',NULL,'Hồ lớn nhất Hà Nội',NULL,'0');
INSERT INTO mission_options VALUES ('3','5','b','💧','Hồ Thiên Quang',NULL,'Hồ trong Văn Miếu',NULL,'1');
INSERT INTO mission_options VALUES ('3','5','c','🌊','Hồ Hoàn Kiếm',NULL,'Hồ trả gươm thần',NULL,'0');
INSERT INTO mission_options VALUES ('3','5','d','🏊','Ao Cá Bác Hồ',NULL,'Khu Phủ Chủ tịch',NULL,'0');
INSERT INTO missions VALUES ('4','1','QUAN SÁT',NULL,'Đây là nơi tên tuổi của những người tài giỏi nhất Đại Việt được khắc vào đá để truyền đời.',NULL,'Đếm số nhà bia ở hai bên hồ Thiên Quang — có bao nhiêu tấm bia tổng cộng?',NULL,'Đi dọc theo hàng bia và đếm — mỗi bia đặt trên một rùa đá.',NULL,'Hiện nay có bao nhiêu tấm bia tiến sĩ được bảo tồn tại Văn Miếu?',NULL,'Con số này ít hơn tổng số kỳ thi tiến sĩ — một số bia đã bị mất qua chiến tranh và thời gian.',NULL,'🪨','Mảnh Bia Đá Cổ',NULL,'rare','Ban đầu có 116 tấm bia, nhưng qua thời gian và chiến tranh, chỉ còn 82 tấm được bảo tồn. Năm 2010, UNESCO công nhận đây là Di sản Tư liệu Thế giới.',NULL,'100','82 bia → 82 kỳ thi → Tìm bia cổ nhất!',NULL);
INSERT INTO mission_options VALUES ('4','1','a','🔢','54 tấm',NULL,'Số tỉnh thành Việt Nam',NULL,'0');
INSERT INTO mission_options VALUES ('4','1','b','🔢','72 tấm',NULL,'Tứ thập nhị chương',NULL,'0');
INSERT INTO mission_options VALUES ('4','1','c','🔢','82 tấm',NULL,'Di sản thế giới UNESCO',NULL,'1');
INSERT INTO mission_options VALUES ('4','1','d','🔢','108 tấm',NULL,'Số anh hùng Lương Sơn',NULL,'0');
INSERT INTO missions VALUES ('4','2','QUAN SÁT',NULL,'Con vật này không được chọn ngẫu nhiên để cõng bia. Nó mang ý nghĩa đặc biệt trong văn hóa Việt.',NULL,'Quan sát kỹ phần đế của các tấm bia — con vật nào đang đội tấm đá?',NULL,'Cúi xuống nhìn phần chân bia — hình con vật nào đang xuất hiện?',NULL,'Con vật nào được tạc bằng đá để đội các tấm bia tiến sĩ?',NULL,'Loài vật này sống hàng trăm năm và được cho là đội cả vũ trụ trên lưng trong thần thoại Việt.',NULL,'🐢','Rùa Đá Thiên Niên',NULL,'legendary','Rùa (Quy) là một trong Tứ Linh — rùa đội bia tượng trưng cho sự trường tồn của tri thức. Mỗi con rùa được chạm khắc khác nhau, phản ánh phong cách nghệ thuật của từng triều đại.',NULL,'150','Rùa thần → Tứ linh → Tìm Long, Lân, Phụng còn lại!',NULL);
INSERT INTO mission_options VALUES ('4','2','a','🐘','Voi đá',NULL,'Biểu tượng sức mạnh',NULL,'0');
INSERT INTO mission_options VALUES ('4','2','b','🦁','Nghê đá',NULL,'Linh vật canh gác',NULL,'0');
INSERT INTO mission_options VALUES ('4','2','c','🐢','Rùa đá',NULL,'Trường thọ, bền vững',NULL,'1');
INSERT INTO mission_options VALUES ('4','2','d','🐯','Hổ đá',NULL,'Dũng mãnh, oai phong',NULL,'0');
INSERT INTO missions VALUES ('4','3','KIẾN THỨC',NULL,'Tấm bia cổ nhất ghi lại những tiến sĩ đã được khoa cử từ thời Lê Sơ — gần 600 năm trước.',NULL,'Tìm tấm bia cổ nhất (có biển hướng dẫn) — năm nào được khắc đầu tiên?',NULL,'Đi theo biển chỉ dẫn đến tấm bia đầu tiên — đọc dòng năm khắc bia.',NULL,'Tấm bia tiến sĩ đầu tiên được dựng vào năm nào?',NULL,'Vua Lê Thánh Tông ban chiếu dựng bia để "khuyến khích người tài, trừng phạt kẻ lười".',NULL,'🏺','Dấu Ấn Lê Thánh Tông',NULL,'legendary','Vua Lê Thánh Tông (1442–1497) là người đầu tiên ra lệnh dựng bia năm 1484, ghi lại 1017 tiến sĩ từ năm 1442. Ông cũng là người mở rộng Đại Việt nhất trong lịch sử.',NULL,'150','1484 → Lê Thánh Tông → Vị vua học giỏi nhất Việt Nam!',NULL);
INSERT INTO mission_options VALUES ('4','3','a','📅','1076',NULL,'Năm lập Quốc Tử Giám',NULL,'0');
INSERT INTO mission_options VALUES ('4','3','b','📅','1253',NULL,'Thời Trần Thái Tông',NULL,'0');
INSERT INTO mission_options VALUES ('4','3','c','📅','1484',NULL,'Thời Lê Thánh Tông',NULL,'1');
INSERT INTO mission_options VALUES ('4','3','d','📅','1802',NULL,'Đầu triều Nguyễn',NULL,'0');
INSERT INTO missions VALUES ('4','4','KHÁM PHÁ',NULL,'"Thiên Quang" — ánh sáng từ trời cao chiếu xuống giếng này mỗi ngày như ban phước cho người học.',NULL,'Đọc nghĩa của "Thiên Quang Tỉnh" — ba chữ này dịch ra tiếng Việt là gì?',NULL,'Tìm tấm biển giải thích tên hồ — đọc và ghi nhớ nghĩa.',NULL,'"Thiên Quang Tỉnh" (天光井) có nghĩa đen là gì?',NULL,'"Thiên" = trời, "Quang" = ánh sáng/sáng rỡ, "Tỉnh" = giếng nước.',NULL,'☀️','Ánh Thiên Quang',NULL,'rare','Hồ Thiên Quang được thiết kế để ánh sáng mặt trời chiếu thẳng xuống vào đúng chính ngọ — một ẩn dụ cho tri thức khai sáng tâm trí người học.',NULL,'100','Ánh sáng trời → Khai sáng → Tìm nguồn sáng trong Điện!',NULL);
INSERT INTO mission_options VALUES ('4','4','a','☀️','Giếng ánh sáng trời',NULL,'Ánh sáng từ thiên đình',NULL,'1');
INSERT INTO mission_options VALUES ('4','4','b','🌟','Ao sao đêm',NULL,'Phản chiếu sao trời',NULL,'0');
INSERT INTO mission_options VALUES ('4','4','c','🌸','Hồ hoa thiên lý',NULL,'Hoa nở khắp trời',NULL,'0');
INSERT INTO mission_options VALUES ('4','4','d','🌙','Giếng trăng vàng',NULL,'Ánh trăng soi đáy giếng',NULL,'0');
INSERT INTO missions VALUES ('4','5','KIẾN THỨC',NULL,'Hãy đọc một số tên trên bia — đây là danh sách những người xuất sắc nhất của dân tộc Việt.',NULL,'Tìm số liệu tổng số tiến sĩ được ghi danh trên tất cả 82 tấm bia.',NULL,'Tìm bảng thống kê hoặc tờ rơi giới thiệu — tổng số là bao nhiêu?',NULL,'Tổng số tiến sĩ được khắc tên trên 82 tấm bia là bao nhiêu vị?',NULL,'Con số này trải dài qua 26 đời vua Lê và Mạc, từ 1442 đến 1779.',NULL,'📛','Danh Sách Tiến Sĩ',NULL,'rare','1307 tiến sĩ trong 337 năm — trung bình mỗi năm chỉ có 4 người đạt danh hiệu cao quý nhất. Trong số đó có Nguyễn Trãi, Lê Quý Đôn và nhiều danh nhân lịch sử.',NULL,'100','1307 tiến sĩ → Tìm tên 3 danh nhân nổi tiếng nhất!',NULL);
INSERT INTO mission_options VALUES ('4','5','a','🔢','500 vị',NULL,'Nửa nghìn anh tài',NULL,'0');
INSERT INTO mission_options VALUES ('4','5','b','🔢','999 vị',NULL,'Gần một nghìn người',NULL,'0');
INSERT INTO mission_options VALUES ('4','5','c','🔢','1307 vị',NULL,'Hơn nghìn học giả',NULL,'1');
INSERT INTO mission_options VALUES ('4','5','d','🔢','2000 vị',NULL,'Hai nghìn tiến sĩ',NULL,'0');
INSERT INTO missions VALUES ('5','1','KIẾN THỨC',NULL,'Vị thánh được thờ phụng phía sau cánh cổng này là người đã đặt nền tảng cho học vấn của cả châu Á.',NULL,'Đọc biển thông tin trước Đại Thành Môn — ai là vị thần được thờ chính?',NULL,'Tìm bảng giới thiệu — đọc tên vị thánh được thờ phụng trong Điện Đại Thành.',NULL,'Đi qua Đại Thành Môn, bạn bước vào khu thờ phụng ai?',NULL,'"Vạn thế sư biểu" = Người thầy của vạn đời — danh hiệu của người sáng lập Nho học.',NULL,'📕','Luận Ngữ Bản Cổ',NULL,'legendary','Khổng Tử (551–479 TCN) là người sáng lập Nho giáo. Ông nói: "Học mà không suy thì vô ích; suy mà không học thì nguy hiểm." Tư tưởng của ông định hình văn hóa châu Á hơn 2500 năm.',NULL,'150','Khổng Tử → Vạn thế → Tìm bàn thờ chính trong Điện!',NULL);
INSERT INTO mission_options VALUES ('5','1','a','🎓','Khổng Tử',NULL,'Vạn thế sư biểu',NULL,'1');
INSERT INTO mission_options VALUES ('5','1','b','👑','Vua Lý Thánh',NULL,'Người lập Văn Miếu',NULL,'0');
INSERT INTO mission_options VALUES ('5','1','c','📚','Chu Văn An',NULL,'Thầy giáo vĩ đại nhất',NULL,'0');
INSERT INTO mission_options VALUES ('5','1','d','🏹','Vua Lê Lợi',NULL,'Anh hùng dân tộc',NULL,'0');
INSERT INTO missions VALUES ('5','2','QUAN SÁT',NULL,'"Đại Thành" — sự hoàn hảo tuyệt đối. Tên này không đơn thuần là "thành tích lớn" đâu nhé.',NULL,'Đọc biển chú thích về tên "Đại Thành Môn" — nghĩa đích thực là gì?',NULL,'Tìm biển diễn giải tên cổng và đọc kỹ phần giải thích.',NULL,'"Đại Thành" (大成) trong bối cảnh Nho học có nghĩa là gì?',NULL,'Mencius gọi Khổng Tử là "Đại Thành" — người hoàn thiện nhất mọi đức hạnh của thánh nhân.',NULL,'💎','Ngọc Đức Hạnh',NULL,'rare','"Đại Thành Chí Thánh" là danh hiệu đầy đủ của Khổng Tử trong Nho giáo. Mạnh Tử đã nói: Khổng Tử là người tổng hợp và hoàn thiện toàn bộ đạo đức của các thánh nhân trước ông.',NULL,'120','Đức hạnh hoàn hảo → Hoàn thiện bản thân → Tìm Tứ Phối!',NULL);
INSERT INTO mission_options VALUES ('5','2','a','🏆','Thành tích vĩ đại',NULL,'Kết quả xuất sắc nhất',NULL,'0');
INSERT INTO mission_options VALUES ('5','2','b','🌟','Đức hạnh hoàn toàn',NULL,'Hoàn thiện tuyệt đối',NULL,'1');
INSERT INTO mission_options VALUES ('5','2','c','🏙️','Thành phố lớn',NULL,'Đô thị phồn thịnh',NULL,'0');
INSERT INTO mission_options VALUES ('5','2','d','💎','Bảo vật hoàn hảo',NULL,'Ngọc quý đức hạnh',NULL,'0');
INSERT INTO missions VALUES ('5','3','QUAN SÁT',NULL,'Nghê đứng canh hai bên cổng — nhưng lần này chúng khác với Nghê ở trụ biểu bên ngoài.',NULL,'Quan sát hai bên cổng Đại Thành Môn — vật gì đang canh giữ hai bên?',NULL,'Nhìn sang hai bên cánh cổng — linh vật gì đang đứng ở đây?',NULL,'Con vật nào đang canh giữ hai bên cổng Đại Thành Môn?',NULL,'Linh vật này xuất hiện ở cả trụ biểu ngoài và cổng trong — nó là linh vật đặc trưng của Văn Miếu.',NULL,'🗿','Nghê Đá Đại Thành',NULL,'rare','Nghê đá tại Đại Thành Môn được chạm khắc thời Lê – Nguyễn, tinh xảo hơn Nghê ở ngoài cổng. Khuôn mặt hiền hòa nhưng uy nghiêm, đặc trưng nghệ thuật điêu khắc Việt thế kỷ XVIII.',NULL,'100','Nghê Đại Thành → Tinh xảo hơn → So sánh với Nghê trụ biểu!',NULL);
INSERT INTO mission_options VALUES ('5','3','a','🦁','Nghê đá',NULL,'Linh vật học vấn',NULL,'1');
INSERT INTO mission_options VALUES ('5','3','b','🐲','Rồng đá',NULL,'Linh vật hoàng gia',NULL,'0');
INSERT INTO mission_options VALUES ('5','3','c','🦅','Phượng đá',NULL,'Linh vật đức hạnh',NULL,'0');
INSERT INTO mission_options VALUES ('5','3','d','🐯','Hổ đá',NULL,'Linh vật dũng mãnh',NULL,'0');
INSERT INTO missions VALUES ('5','4','QUAN SÁT',NULL,'Màu cánh cửa ở đây cũng giống màu đã gặp bên ngoài — màu sắc nhất quán trong toàn khu Văn Miếu.',NULL,'Nhìn vào cánh cửa gỗ lớn của Đại Thành Môn — màu sơn là màu gì?',NULL,'Quan sát thật kỹ màu sắc của cánh cửa gỗ phía trước mặt.',NULL,'Cánh cửa gỗ của Đại Thành Môn được sơn màu gì?',NULL,'Cùng màu với tường và cột ở khắp Văn Miếu — màu này được gọi là "chu sa" hay "son".',NULL,'🖌️','Hộp Chu Sa',NULL,'common','Chu sa (vermillion) được làm từ thủy ngân sulfide — màu đỏ tươi rực rỡ không phai theo thời gian. Người xưa tin màu này xua đuổi tà khí và thu hút phúc lộc.',NULL,'80','Đỏ son → Khắp Văn Miếu → Đếm xem có bao nhiêu thứ đỏ?',NULL);
INSERT INTO mission_options VALUES ('5','4','a','🔴','Đỏ son',NULL,'Màu linh thiêng Á Đông',NULL,'1');
INSERT INTO mission_options VALUES ('5','4','b','🟡','Vàng',NULL,'Màu hoàng gia',NULL,'0');
INSERT INTO mission_options VALUES ('5','4','c','🟢','Xanh lá',NULL,'Màu thiên nhiên',NULL,'0');
INSERT INTO mission_options VALUES ('5','4','d','⚫','Đen',NULL,'Màu trang nghiêm',NULL,'0');
INSERT INTO missions VALUES ('5','5','KIẾN THỨC',NULL,'Trong lịch sử, một vị thầy vĩ đại người Việt đã được thờ phụng ngang hàng với Khổng Tử tại đây.',NULL,'Tìm thông tin về người thầy nổi tiếng nhất Việt Nam được thờ trong Văn Miếu.',NULL,'Tìm biển giới thiệu về các vị được thờ — ai là người Việt duy nhất được thờ ở đây?',NULL,'Người Việt Nam duy nhất được thờ phụng trong Văn Miếu cùng Khổng Tử là ai?',NULL,'Ông từng dâng "Thất trảm sớ" đòi chém 7 tên nịnh thần — và từ chối làm quan khi vua không nghe.',NULL,'👨‍🏫','Chân Dung Chu Văn An',NULL,'legendary','Chu Văn An (1292–1370) là người thầy được kính trọng nhất Việt Nam. Học trò của ông có tể tướng và quan đại thần. Ông từ chức về ẩn cư để giữ đạo khi nhà vua không nghe lời can gián.',NULL,'150','Chu Văn An → Người thầy bất khuất → Tìm chân dung trong Điện!',NULL);
INSERT INTO mission_options VALUES ('5','5','a','📖','Chu Văn An',NULL,'Thầy giáo thiên tài',NULL,'1');
INSERT INTO mission_options VALUES ('5','5','b','👑','Lý Thái Tổ',NULL,'Vua lập Hà Nội',NULL,'0');
INSERT INTO mission_options VALUES ('5','5','c','🖊️','Nguyễn Trãi',NULL,'Anh hùng – văn nhân',NULL,'0');
INSERT INTO mission_options VALUES ('5','5','d','🏹','Trần Hưng Đạo',NULL,'Đại tướng huyền thoại',NULL,'0');
INSERT INTO missions VALUES ('6','1','QUAN SÁT',NULL,'Đây là nơi thiêng liêng nhất. Hãy bước vào với tấm lòng thành kính.',NULL,'Nhìn vào bàn thờ chính giữa Điện Đại Thành — ai đang được đặt ở vị trí trung tâm?',NULL,'Bước vào điện, nhìn thẳng vào bàn thờ chính — ai ở vị trí trung tâm cao nhất?',NULL,'Ai được thờ phụng ở vị trí trung tâm cao nhất trong Điện Đại Thành?',NULL,'"Vạn thế sư biểu" — người thầy của muôn đời. Tượng vàng lớn nhất ở giữa.',NULL,'🕍','Tượng Khổng Tử Bản Đồng',NULL,'legendary','Tượng Khổng Tử trong Điện Đại Thành được phủ vàng, ngồi trang nghiêm trên ngai. Hai bên là Tứ Phối — bốn học trò vĩ đại nhất. Hương khói không bao giờ tắt từ thế kỷ XI.',NULL,'150','Khổng Tử → Trung tâm → Tìm bốn học trò Tứ Phối!',NULL);
INSERT INTO mission_options VALUES ('6','1','a','🎓','Khổng Tử',NULL,'Đức Thánh Nhân',NULL,'1');
INSERT INTO mission_options VALUES ('6','1','b','📚','Mạnh Tử',NULL,'Á Thánh Nho học',NULL,'0');
INSERT INTO mission_options VALUES ('6','1','c','👑','Vua Lê',NULL,'Thiên tử triều Lê',NULL,'0');
INSERT INTO mission_options VALUES ('6','1','d','🏛️','Trời Đất',NULL,'Thiên địa linh thiêng',NULL,'0');
INSERT INTO missions VALUES ('6','2','QUAN SÁT',NULL,'Hai bên Khổng Tử có bốn học trò vĩ đại nhất của ông — Tứ Phối. Hãy đếm và quan sát.',NULL,'Đếm số tượng/bàn thờ phụ hai bên Khổng Tử trong điện.',NULL,'Nhìn sang hai bên tượng Khổng Tử — đếm số vị thánh được thờ cùng.',NULL,'"Tứ Phối" — có bao nhiêu vị thánh được thờ cùng Khổng Tử?',NULL,'"Tứ" trong tiếng Hán có nghĩa là số 4. Tứ Phối gồm: Nhan Hồi, Tăng Sâm, Tử Tư, Mạnh Tử.',NULL,'👥','Tranh Tứ Phối',NULL,'rare','Tứ Phối (Bốn bậc phối hưởng) là bốn học trò giỏi nhất của Khổng Tử: Nhan Hồi (đức hạnh), Tăng Sâm (hiếu thảo), Tử Tư (triết học), Mạnh Tử (chính trị). Mỗi người phát triển một khía cạnh của Nho học.',NULL,'100','Tứ Phối → 4 học trò → Tìm tên từng người trên bài vị!',NULL);
INSERT INTO mission_options VALUES ('6','2','a','2️⃣','2 vị',NULL,'Nhị Thánh',NULL,'0');
INSERT INTO mission_options VALUES ('6','2','b','3️⃣','3 vị',NULL,'Tam Thánh',NULL,'0');
INSERT INTO mission_options VALUES ('6','2','c','4️⃣','4 vị',NULL,'Tứ Phối',NULL,'1');
INSERT INTO mission_options VALUES ('6','2','d','5️⃣','5 vị',NULL,'Ngũ Thánh',NULL,'0');
INSERT INTO missions VALUES ('6','3','QUAN SÁT',NULL,'Hương khói không bao giờ tắt ở đây — loại hương đặc biệt được dâng lên vị thánh của tri thức.',NULL,'Nhìn lên các đồ thờ tự trên bàn thờ — vật phẩm dâng cúng chính là gì?',NULL,'Quan sát bàn thờ — các lư đốt gì? Hoa gì đang được dâng lên?',NULL,'Loài hoa nào thường được dâng cúng trong Điện Đại Thành?',NULL,'Loài hoa biểu tượng cho sự thanh cao và đức hạnh — đã gặp ở chân cột Văn Miếu Môn.',NULL,'🪷','Hoa Sen Dâng Thánh',NULL,'common','Hoa sen trắng là vật phẩm không thể thiếu trong lễ tế Khổng Tử. Màu trắng tượng trưng cho sự trong sạch của tâm hồn người học; mùi hương nhẹ nhàng không át mùi hương trầm.',NULL,'80','Hoa sen → Đã gặp ở đầu → Vòng lại đếm lần thứ hai!',NULL);
INSERT INTO mission_options VALUES ('6','3','a','🌸','Hoa đào',NULL,'Mùa xuân tươi mới',NULL,'0');
INSERT INTO mission_options VALUES ('6','3','b','🪷','Hoa sen',NULL,'Thanh cao, thuần khiết',NULL,'1');
INSERT INTO mission_options VALUES ('6','3','c','🌹','Hoa hồng',NULL,'Tình yêu và kính trọng',NULL,'0');
INSERT INTO mission_options VALUES ('6','3','d','🌻','Hoa hướng dương',NULL,'Hướng về ánh sáng',NULL,'0');
INSERT INTO missions VALUES ('6','4','QUAN SÁT',NULL,'Kiến trúc của điện thờ này phản ánh phong cách triều đình — cột gỗ lớn sơn đỏ, mái ngói cong.',NULL,'Đếm số cột lớn bên trong Điện Đại Thành.',NULL,'Bước vào và đếm thật kỹ các hàng cột gỗ lớn — bao nhiêu cột?',NULL,'Điện Đại Thành có bao nhiêu cột gỗ lớn bên trong?',NULL,'Đếm theo 4 hàng cột: hàng ngoài trước, hàng trong sau.',NULL,'🏛️','Sơ Đồ Điện Thờ',NULL,'common','16 cột gỗ lim lớn được sơn đỏ son, đội mái ngói ngả cánh về phía trước. Kiểu kiến trúc "trùng thiềm điệp ốc" hai tầng mái này là đỉnh cao của nghệ thuật kiến trúc cung đình Việt.',NULL,'80','16 cột → Kết cấu hoàn hảo → Tìm ý nghĩa con số 16!',NULL);
INSERT INTO mission_options VALUES ('6','4','a','🔢','8 cột',NULL,'Bát trụ',NULL,'0');
INSERT INTO mission_options VALUES ('6','4','b','🔢','12 cột',NULL,'Thập nhị trụ',NULL,'0');
INSERT INTO mission_options VALUES ('6','4','c','🔢','16 cột',NULL,'Thập lục trụ',NULL,'1');
INSERT INTO mission_options VALUES ('6','4','d','🔢','20 cột',NULL,'Nhị thập trụ',NULL,'0');
INSERT INTO missions VALUES ('6','5','KIẾN THỨC',NULL,'Lễ tế tại đây được tổ chức đúng hai lần mỗi năm — theo quy định của Nho giáo truyền thống.',NULL,'Tìm thông tin về lịch lễ tế Khổng Tử trong năm.',NULL,'Đọc bảng thông tin về lịch lễ tế — diễn ra vào tháng nào?',NULL,'Lễ tế Khổng Tử tại Điện Đại Thành được tổ chức mấy lần mỗi năm?',NULL,'"Xuân Thu nhị tế" — lễ vào mùa xuân (tháng 2 âm lịch) và mùa thu (tháng 8 âm lịch).',NULL,'🗓️','Lịch Lễ Xuân Thu',NULL,'rare','Hai lễ tế trong năm tương ứng với thời điểm gieo hạt (xuân) và thu hoạch (thu) — ẩn dụ cho việc học hành: gieo tri thức và thu hoạch kết quả. Nghi lễ không thay đổi từ thế kỷ XI.',NULL,'100','Xuân Thu → Mùa học → Tìm lịch thi cử xưa trong Nhà Thái Học!',NULL);
INSERT INTO mission_options VALUES ('6','5','a','1️⃣','1 lần',NULL,'Đại lễ hàng năm',NULL,'0');
INSERT INTO mission_options VALUES ('6','5','b','2️⃣','2 lần',NULL,'Xuân Thu nhị tế',NULL,'1');
INSERT INTO mission_options VALUES ('6','5','c','4️⃣','4 lần',NULL,'Tứ quý lễ tế',NULL,'0');
INSERT INTO mission_options VALUES ('6','5','d','🔢','12 lần',NULL,'Lễ hàng tháng',NULL,'0');
INSERT INTO missions VALUES ('7','1','KIẾN THỨC',NULL,'Đây là điểm kết thúc hành trình — và cũng là nơi khởi đầu của mọi tri thức Việt Nam.',NULL,'Tìm bảng thông tin về lịch sử thành lập Quốc Tử Giám.',NULL,'Đọc tấm biển lớn ở lối vào Nhà Thái Học — năm thành lập là năm nào?',NULL,'Quốc Tử Giám — trường đại học đầu tiên của Việt Nam — được thành lập năm nào?',NULL,'Vua Lý Nhân Tông lập trường này một năm sau khi xây Văn Miếu (1070) để có nơi đào tạo quan lại.',NULL,'🎓','Học Bổng Đầu Tiên',NULL,'legendary','Năm 1076, vua Lý Nhân Tông lập Quốc Tử Giám, mở ra kỷ nguyên giáo dục Việt Nam. Đây là trường đại học đầu tiên ở Đông Nam Á — trước cả Oxford và Cambridge nhiều năm.',NULL,'150','1076 → Triều Lý → Nền giáo dục 950 năm tuổi!',NULL);
INSERT INTO mission_options VALUES ('7','1','a','📅','939',NULL,'Ngô Quyền lập quốc',NULL,'0');
INSERT INTO mission_options VALUES ('7','1','b','📅','1010',NULL,'Lý Thái Tổ lập Thăng Long',NULL,'0');
INSERT INTO mission_options VALUES ('7','1','c','📅','1076',NULL,'Lý Nhân Tông lập trường',NULL,'1');
INSERT INTO mission_options VALUES ('7','1','d','📅','1428',NULL,'Lê Lợi lập nhà Lê',NULL,'0');
INSERT INTO missions VALUES ('7','2','KIẾN THỨC',NULL,'Không phải ai cũng được vào học ở đây từ đầu. Hãy tìm hiểu đối tượng ban đầu được nhận.',NULL,'Tìm thông tin về đối tượng học sinh ban đầu của Quốc Tử Giám.',NULL,'Đọc bảng giới thiệu — ai được phép học ở Quốc Tử Giám buổi đầu?',NULL,'Khi mới thành lập, ai được phép vào học Quốc Tử Giám?',NULL,'"Quốc Tử" = con cái của quốc gia (hoàng tộc và quý tộc). Ban đầu trường chỉ dành cho giai cấp trên.',NULL,'👑','Thẻ Bài Quý Tộc',NULL,'rare','Quốc Tử Giám ban đầu chỉ nhận con em vua và quan lại cao cấp. Mãi đến thời Lý Nhân Tông mới mở rộng cho "con em thường dân có tài năng xuất sắc" — một bước đột phá dân chủ lớn cho thời đại.',NULL,'100','Quý tộc → Dân thường → Xã hội ngày càng công bằng hơn!',NULL);
INSERT INTO mission_options VALUES ('7','2','a','👑','Hoàng tử và con quý tộc',NULL,'Giới tinh hoa thượng lưu',NULL,'1');
INSERT INTO mission_options VALUES ('7','2','b','👥','Tất cả mọi người',NULL,'Học cho dân',NULL,'0');
INSERT INTO mission_options VALUES ('7','2','c','⚔️','Con nhà binh',NULL,'Học trò võ tướng',NULL,'0');
INSERT INTO mission_options VALUES ('7','2','d','🌾','Con nhà nông',NULL,'Học trò bình dân',NULL,'0');
INSERT INTO missions VALUES ('7','3','KIẾN THỨC',NULL,'Chương trình học ở đây không giống trường hiện đại. Môn học chính là những bộ sách kinh điển của Nho giáo.',NULL,'Tìm thông tin về chương trình giảng dạy trong Nhà Thái Học.',NULL,'Đọc tấm biển về chương trình học — môn học chính là gì?',NULL,'Môn học chủ yếu tại Quốc Tử Giám là gì?',NULL,'Tứ Thư Ngũ Kinh — 9 cuốn sách kinh điển Nho giáo là nội dung thi cử và giảng dạy chính.',NULL,'📚','Tứ Thư Ngũ Kinh',NULL,'legendary','Chương trình học gồm: Tứ Thư (Đại Học, Trung Dung, Luận Ngữ, Mạnh Tử) và Ngũ Kinh (Kinh Thi, Thư, Lễ, Dịch, Xuân Thu). Học sinh phải học thuộc lòng và bình luận bằng chữ Hán.',NULL,'150','Tứ Thư Ngũ Kinh → 9 cuốn → Tìm một cuốn trong phòng trưng bày!',NULL);
INSERT INTO mission_options VALUES ('7','3','a','🔢','Toán học',NULL,'Số học và hình học',NULL,'0');
INSERT INTO mission_options VALUES ('7','3','b','📖','Nho học',NULL,'Tứ Thư Ngũ Kinh',NULL,'1');
INSERT INTO mission_options VALUES ('7','3','c','⚔️','Võ nghệ',NULL,'Binh pháp và kiếm thuật',NULL,'0');
INSERT INTO mission_options VALUES ('7','3','d','🌾','Nông nghiệp',NULL,'Canh tác và thủy lợi',NULL,'0');
INSERT INTO missions VALUES ('7','4','KIẾN THỨC',NULL,'Một vị vua đặc biệt đã phá vỡ rào cản giai cấp — mở cửa trường cho những tài năng bình dân.',NULL,'Tìm thông tin về vị vua mở rộng đối tượng học sinh cho Quốc Tử Giám.',NULL,'Đọc về lịch sử phát triển trường — ai là người đầu tiên nhận học trò bình dân?',NULL,'Vị vua nào mở rộng Quốc Tử Giám để nhận cả học trò tài giỏi từ tầng lớp thường dân?',NULL,'Cũng chính là vị vua thành lập trường năm 1076 — ông vừa lập trường vừa mở rộng đối tượng.',NULL,'🤝','Chiếu Tuyển Học Trò',NULL,'rare','Vua Lý Nhân Tông (1066–1128) không chỉ lập trường mà còn quy định "học trò tài giỏi từ dân thường đều được vào học." Đây là tư tưởng bình đẳng giáo dục đi trước thời đại hàng thế kỷ.',NULL,'100','Lý Nhân Tông → Bình đẳng → Tri thức cho tất cả mọi người!',NULL);
INSERT INTO mission_options VALUES ('7','4','a','👑','Lý Thánh Tông',NULL,'Người lập Văn Miếu 1070',NULL,'0');
INSERT INTO mission_options VALUES ('7','4','b','👑','Lý Nhân Tông',NULL,'Người mở rộng tiếp cận',NULL,'1');
INSERT INTO mission_options VALUES ('7','4','c','👑','Trần Nhân Tông',NULL,'Phật hoàng nổi tiếng',NULL,'0');
INSERT INTO mission_options VALUES ('7','4','d','👑','Lê Thánh Tông',NULL,'Người dựng bia tiến sĩ',NULL,'0');
INSERT INTO missions VALUES ('7','5','KHÁM PHÁ',NULL,'Hành trình của đệ gần kết thúc rồi. Câu hỏi cuối cùng — nhưng quan trọng nhất.',NULL,'Tìm năm phục dựng Nhà Thái Học hiện tại trên bảng thông tin.',NULL,'Đọc biển giới thiệu Nhà Thái Học — năm nào công trình được phục dựng?',NULL,'Nhà Thái Học hiện tại được xây dựng lại (phục dựng) vào năm nào?',NULL,'Nhà Thái Học được phục dựng cho dịp kỷ niệm 990 năm Thăng Long — ngay trước đại lễ 1000 năm 2010.',NULL,'🏆','🏆 Huy Hiệu Đại Học Sĩ',NULL,'legendary','Chúc mừng! Bạn đã khám phá toàn bộ Văn Miếu – Quốc Tử Giám và đạt danh hiệu Đại Học Sĩ. Như những tiến sĩ xưa, bạn đã vượt qua thử thách bằng sự quan sát tinh tường và tri thức sâu sắc.',NULL,'200','🎉 Tất cả bí mật đã được giải mã. Chúc mừng Đại Học Sĩ!',NULL);
INSERT INTO mission_options VALUES ('7','5','a','📅','1954',NULL,'Sau kháng chiến',NULL,'0');
INSERT INTO mission_options VALUES ('7','5','b','📅','1975',NULL,'Thống nhất đất nước',NULL,'0');
INSERT INTO mission_options VALUES ('7','5','c','📅','2000',NULL,'Thiên niên kỷ mới',NULL,'1');
INSERT INTO mission_options VALUES ('7','5','d','📅','2010',NULL,'Đại lễ 1000 năm',NULL,'0');
INSERT INTO collectibles VALUES ('nghe','Nghê',NULL,'🦁','Linh vật',NULL,'rare','Văn Miếu Môn',NULL,'Nhiệm vụ 01',NULL,'Nghê là linh vật bảo vệ cổng đền, tượng trưng cho sự uy nghiêm và trí tuệ. Đôi mắt vàng của Nghê nhìn xuyên suốt mọi tà khí.',NULL,'1');
INSERT INTO collectibles VALUES ('ca-chep','Cá Chép',NULL,'🐟','Linh vật',NULL,'common','Giếng & Bia Tiến Sĩ',NULL,'Nhiệm vụ 04',NULL,'Cá chép vượt vũ môn hóa rồng — biểu tượng của sự kiên trì và thành công trong học vấn. Học trò xưa cầu nguyện cá chép trước kỳ thi.',NULL,'1');
INSERT INTO collectibles VALUES ('rong','Rồng',NULL,'🐉','Linh vật',NULL,'legendary','Đại Trung Môn',NULL,'Nhiệm vụ 02',NULL,'Rồng là biểu tượng của quyền lực hoàng gia và sự thịnh vượng. Hình rồng chầu nguyệt trên nóc đại môn mang ý nghĩa trí tuệ soi sáng thiên hạ.',NULL,'1');
INSERT INTO collectibles VALUES ('hac','Hạc',NULL,'🕊️','Linh vật',NULL,'rare','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Hạc đứng trên lưng rùa tượng trưng cho sự trường thọ và thanh cao. Trong điện thờ Khổng Tử, đôi hạc vàng là biểu tượng của học vấn vĩnh cửu.',NULL,'0');
INSERT INTO collectibles VALUES ('rua-da','Rùa Đá',NULL,'🐢','Linh vật',NULL,'legendary','Giếng & Bia Tiến Sĩ',NULL,'Nhiệm vụ 04',NULL,'82 con rùa đá gánh bia tiến sĩ — biểu tượng của sự bền vững và tri thức trường tồn. Rùa là linh vật trường thọ trong tứ linh.',NULL,'1');
INSERT INTO collectibles VALUES ('ky-lan','Kỳ Lân',NULL,'🦄','Linh vật',NULL,'legendary','Đại Thành Môn',NULL,'Nhiệm vụ 05',NULL,'Kỳ lân xuất hiện khi đất nước có bậc hiền nhân. Linh vật này gác cổng vào nơi thờ Đức Khổng Tử, bảo vệ tinh thần Nho học.',NULL,'0');
INSERT INTO collectibles VALUES ('phuong','Phượng Hoàng',NULL,'🦅','Linh vật',NULL,'legendary','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Phượng hoàng là chim thần của phương Nam, tượng trưng cho vẻ đẹp, hòa bình và trí tuệ. Chỉ đậu xuống nơi có bậc thánh nhân cai trị.',NULL,'0');
INSERT INTO collectibles VALUES ('lan','Lân',NULL,'🦁','Linh vật',NULL,'rare','Khuê Văn Các',NULL,'Nhiệm vụ 03',NULL,'Lân là linh vật mang điềm lành, thường xuất hiện trên các cột trụ và mái đình. Vảy Lân lấp lánh như ánh sao Khuê chiếu sáng bầu trời đêm.',NULL,'0');
INSERT INTO collectibles VALUES ('khue-van','Khuê Văn Các',NULL,'🏯','Kiến trúc',NULL,'rare','Khuê Văn Các',NULL,'Nhiệm vụ 03',NULL,'Xây năm 1805, Khuê Văn Các là biểu tượng văn hóa Hà Nội. Cửa sổ tròn tượng trưng "trời tròn", bốn cửa vuông là "đất vuông" — triết lý âm dương.',NULL,'1');
INSERT INTO collectibles VALUES ('van-mieu-mon','Văn Miếu Môn',NULL,'🏛️','Kiến trúc',NULL,'common','Văn Miếu Môn',NULL,'Nhiệm vụ 01',NULL,'Cổng tam quan Văn Miếu Môn có 3 lối đi tượng trưng cho tam tài (thiên – địa – nhân). Hướng Nam đón nguồn sáng tri thức từ sao Khuê.',NULL,'1');
INSERT INTO collectibles VALUES ('bia-tien-si','Bia Tiến Sĩ',NULL,'🗿','Kiến trúc',NULL,'rare','Giếng & Bia Tiến Sĩ',NULL,'Nhiệm vụ 04',NULL,'82 tấm bia đá khắc tên 1307 tiến sĩ từ 1442–1779. Mỗi bia là một trang lịch sử về những người đã vượt qua thử thách trí tuệ của thời đại.',NULL,'1');
INSERT INTO collectibles VALUES ('gac-doi','Gác Đôi',NULL,'🏗️','Kiến trúc',NULL,'common','Đại Trung Môn',NULL,'Nhiệm vụ 02',NULL,'Kiến trúc 2 tầng mái ngói cong độc đáo của Đại Trung Môn thể hiện phong cách kiến trúc triều Lê. Mỗi góc mái là hình đuôi cá chép uốn lên trời.',NULL,'0');
INSERT INTO collectibles VALUES ('dai-thanh-mon','Đại Thành Môn',NULL,'🚪','Kiến trúc',NULL,'rare','Đại Thành Môn',NULL,'Nhiệm vụ 05',NULL,'Cổng vào nơi thờ Đức Khổng Tử, cánh cửa sơn đỏ son trường tồn. Chỉ quan lại và học trò ưu tú mới được bước qua cổng này thuở xưa.',NULL,'0');
INSERT INTO collectibles VALUES ('nha-thai-hoc','Nhà Thái Học',NULL,'📚','Kiến trúc',NULL,'common','Nhà Thái Học',NULL,'Nhiệm vụ 07',NULL,'Thành lập 1076 dưới thời vua Lý Nhân Tông, Quốc Tử Giám là trường đại học đầu tiên của Việt Nam. Nơi đây nuôi dưỡng tinh hoa của cả dân tộc.',NULL,'0');
INSERT INTO collectibles VALUES ('gieng-thien','Giếng Thiên Quang',NULL,'🪩','Kiến trúc',NULL,'common','Giếng & Bia Tiến Sĩ',NULL,'Nhiệm vụ 04',NULL,'"Thiên Quang" nghĩa là ánh sáng trời. Mặt nước giếng phản chiếu bầu trời và sao Khuê — biểu tượng cho trí tuệ soi sáng con đường học vấn.',NULL,'1');
INSERT INTO collectibles VALUES ('dien-dai','Điện Đại Thành',NULL,'⛩️','Kiến trúc',NULL,'legendary','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Trung tâm của Văn Miếu, nơi thờ Đức Khổng Tử và Tứ Phối. 16 cột gỗ lim chạm khắc tinh xảo nâng đỡ mái ngói ngàn tuổi.',NULL,'0');
INSERT INTO collectibles VALUES ('cuon-thu','Cuốn Thư',NULL,'📜','Biểu tượng',NULL,'common','Văn Miếu Môn',NULL,'Nhiệm vụ 01',NULL,'Cuốn thư là biểu tượng của học vấn và tri thức. Trong Văn Miếu, hình ảnh cuốn thư xuất hiện trên mọi cấu kiện kiến trúc như lời nhắc về sứ mệnh giáo dục.',NULL,'1');
INSERT INTO collectibles VALUES ('sao-khue','Sao Khuê',NULL,'⭐','Biểu tượng',NULL,'rare','Khuê Văn Các',NULL,'Nhiệm vụ 03',NULL,'Sao Khuê (α Virginis) là ngôi sao tượng trưng cho văn chương và học vấn trong thiên văn Á Đông. Khuê Văn Các được đặt tên để vinh danh ngôi sao này.',NULL,'1');
INSERT INTO collectibles VALUES ('trong-dong','Trống Đồng',NULL,'🥁','Biểu tượng',NULL,'rare','Nhà Thái Học',NULL,'Nhiệm vụ 07',NULL,'Trống đồng Đông Sơn là biểu tượng văn minh lâu đời nhất của người Việt. Tiếng trống vang lên trong các lễ hội tưởng niệm tại Văn Miếu.',NULL,'0');
INSERT INTO collectibles VALUES ('hoa-mai','Hoa Mai',NULL,'🌸','Biểu tượng',NULL,'common','Khuê Văn Các',NULL,'Nhiệm vụ 03',NULL,'Hoa mai nở đầu xuân tượng trưng cho sự thuần khiết và kiên cường của bậc quân tử. Học trò xưa trồng mai trong sân Văn Miếu để nhớ đến phẩm hạnh.',NULL,'0');
INSERT INTO collectibles VALUES ('bat-giac','Bát Giác',NULL,'🔯','Biểu tượng',NULL,'common','Khuê Văn Các',NULL,'Nhiệm vụ 03',NULL,'Hình bát giác trong kiến trúc Khuê Văn Các tượng trưng cho bát quái — tám quẻ vũ trụ trong triết học phương Đông, thể hiện sự hòa hợp giữa trời và đất.',NULL,'1');
INSERT INTO collectibles VALUES ('trieu-son','Triện Son',NULL,'🔴','Biểu tượng',NULL,'legendary','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Dấu son đỏ là biểu tượng của xác nhận và quyền lực tri thức. Bằng tiến sĩ được đóng dấu son — chứng nhận cao quý nhất dưới thời phong kiến.',NULL,'0');
INSERT INTO collectibles VALUES ('la-bo-de','Lá Bồ Đề',NULL,'🍃','Biểu tượng',NULL,'common','Nhà Thái Học',NULL,'Nhiệm vụ 07',NULL,'Cây bồ đề là nơi Đức Phật giác ngộ, nhưng trong Văn Miếu — nơi hòa quyện Phật–Nho–Đạo — lá bồ đề tượng trưng cho sự giác ngộ của học vấn.',NULL,'0');
INSERT INTO collectibles VALUES ('an-vang','Ấn Vàng',NULL,'🏅','Biểu tượng',NULL,'legendary','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Ấn vàng là vật báu hoàng gia, chỉ được trao cho người đỗ trạng nguyên. Trong lịch sử 38 khoa thi, chỉ 13 người nhận được vinh dự tối cao này.',NULL,'0');
INSERT INTO collectibles VALUES ('binh-ho-lo','Bình Hồ Lô',NULL,'🏺','Vật phẩm',NULL,'common','Khuê Văn Các',NULL,'Nhiệm vụ 03',NULL,'Bình hồ lô là vật phẩm của các bậc tiên nhân và thầy thuốc. Trong Văn Miếu, hình ảnh hồ lô trang trí trên các cấu kiện là lời chúc học trò trường thọ.',NULL,'1');
INSERT INTO collectibles VALUES ('bup-sen','Búp Sen',NULL,'🪷','Vật phẩm',NULL,'common','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Sen mọc từ bùn mà không hôi tanh mùi bùn — biểu tượng của người quân tử. Dâng sen lên bàn thờ Khổng Tử là lời cầu nguyện cho tâm hồn thanh cao.',NULL,'1');
INSERT INTO collectibles VALUES ('chuong','Chuông',NULL,'🔔','Vật phẩm',NULL,'rare','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Tiếng chuông Văn Miếu vang lên mỗi sáng như lời nhắc nhở học trò bắt đầu ngày học. Hai lần mỗi năm, chuông ngân vang trong đại lễ tế Khổng Tử.',NULL,'0');
INSERT INTO collectibles VALUES ('den-long','Đèn Lồng',NULL,'🏮','Vật phẩm',NULL,'common','Đại Trung Môn',NULL,'Nhiệm vụ 02',NULL,'Đèn lồng đỏ treo trước cổng đền chiếu sáng con đường học vấn. Ngày xưa, học trò nghèo thắp đèn học đến tận khuya để chuẩn bị cho kỳ thi hương.',NULL,'0');
INSERT INTO collectibles VALUES ('muc-tau','Mực Tàu',NULL,'🖌️','Vật phẩm',NULL,'common','Nhà Thái Học',NULL,'Nhiệm vụ 07',NULL,'Mực tàu nghiền từ bồ hóng và keo động vật được dùng để viết lên giấy dó. Mỗi nét chữ của học trò Quốc Tử Giám mang trong đó cả tháng năm khổ luyện.',NULL,'0');
INSERT INTO collectibles VALUES ('nghien','Nghiên Mực',NULL,'🪨','Vật phẩm',NULL,'common','Nhà Thái Học',NULL,'Nhiệm vụ 07',NULL,'Nghiên đá nghiền mực là bạn đồng hành của học trò. Những viên đá đen bóng từ sông Hồng được chọn để chế tác nghiên, mài mực từ sáng sớm đến tối mịt.',NULL,'0');
INSERT INTO collectibles VALUES ('but-long','Bút Lông',NULL,'✒️','Vật phẩm',NULL,'rare','Văn Miếu Môn',NULL,'Nhiệm vụ 01',NULL,'Bút lông là công cụ ghi chép tri thức. Tại lễ khai bút đầu xuân tại Văn Miếu, học trò viết những chữ đầu tiên của năm bằng bút lông để cầu may.',NULL,'1');
INSERT INTO collectibles VALUES ('tram-huong','Trầm Hương',NULL,'🌿','Vật phẩm',NULL,'rare','Điện Đại Thành',NULL,'Nhiệm vụ 06',NULL,'Khói trầm hương bay lên từ lư hương trong Điện Đại Thành mang theo lời nguyện cầu đến Đức Khổng Tử. Mùi hương trầm gợi lên không khí trang nghiêm ngàn năm.',NULL,'0');
INSERT INTO collectibles VALUES ('non-la','Nón Lá',NULL,'🎓','Vật phẩm',NULL,'common','Văn Miếu Môn',NULL,'Nhiệm vụ 01',NULL,'Nón lá trắng của Văn Đồng — người dẫn đường cho học trò khám phá Văn Miếu. Mỗi nón lá được dệt từ lá cọ, nhẹ mà bền, che nắng che mưa trên đường học.',NULL,'1');
INSERT INTO collectibles VALUES ('cuon-kinh','Cuốn Kinh',NULL,'📖','Vật phẩm',NULL,'rare','Nhà Thái Học',NULL,'Nhiệm vụ 07',NULL,'Luận Ngữ — kiệt tác triết học của Đức Khổng Tử được giảng dạy tại Quốc Tử Giám suốt 700 năm. "Học mà không suy nghĩ thì vô ích."',NULL,'0');
INSERT INTO achievements VALUES ('first-step','👣','Bước chân sĩ tử',NULL,'Hoàn thành trạm đầu tiên.',NULL,'#FFF0E0','#FFE0C0','#F0C0A0');
INSERT INTO achievements VALUES ('clue-hunter','👁️','Mắt tinh Văn Miếu',NULL,'Thu thập 5 manh mối.',NULL,'#E8F4FF','#D0E8FF','#A0C4F0');
INSERT INTO achievements VALUES ('decoder','🔐','Nhà giải mã',NULL,'Giải đúng 10 câu đố liên tiếp.',NULL,'#F0FFF0','#D8F0D8','#A0D8A0');
INSERT INTO achievements VALUES ('master','🏆','Bậc thầy Thăng Long',NULL,'Hoàn thành cả 7 trạm.',NULL,'#FFFBE0','#FFF0A0','#D4A017');
INSERT INTO achievements VALUES ('collector','🎴','Nhà sưu tập',NULL,'Thu thập 15 vật phẩm.',NULL,'#FFF0FF','#F0D8FF','#D0A0F0');
INSERT INTO achievements VALUES ('scholar','📚','Học giả Nho học',NULL,'Hoàn thành 3 trạm.',NULL,'#FFF8E0','#FFF0C0','#E0C060');
INSERT INTO achievements VALUES ('explorer','🧭','Thám tử Văn Miếu',NULL,'Hoàn thành 5 trạm.',NULL,'#E8FFF4','#C8F0E0','#80C8A8');
INSERT INTO achievements VALUES ('xp-king','⭐','Vương giả điểm số',NULL,'Tích lũy 500 XP.',NULL,'#FFF8E0','#FFEEA0','#C4941A');
INSERT INTO achievements VALUES ('speed','⚡','Thần tốc khai sáng',NULL,'Hoàn thành 2 trạm liên tiếp.',NULL,'#FFFFF0','#FFFF80','#D4C000');
INSERT INTO achievements VALUES ('perfect','💎','Hoàn hảo tuyệt đối',NULL,'Hoàn thành toàn bộ bộ sưu tập.',NULL,'#F0FFFF','#C0F0F8','#60C8E0');
INSERT INTO help_sections VALUES ('how-to-play','🎮','Cách chơi',NULL,'Mật Mã Thăng Long là trò chơi khám phá thực tế tại Văn Miếu – Quốc Tử Giám.

1. Chọn một trạm trên bản đồ để bắt đầu
2. Đọc nhiệm vụ và quan sát thực tế xung quanh bạn
3. Trả lời câu đố để thu thập manh mối
4. Hoàn thành 5 thử thách để mở khóa trạm tiếp theo
5. Thu thập đủ 7 con dấu để hoàn thành hành trình!',NULL);
INSERT INTO help_sections VALUES ('kit','🎒','Cách sử dụng bộ kit',NULL,'Bộ kit khám phá của bạn gồm:

• 📋 Bản đồ giấy — đối chiếu với bản đồ số
• 🔍 Kính lúp — dùng để đọc chữ nhỏ trên bia đá
• 📓 Sổ tay ghi chép — ghi lại những gì bạn quan sát
• ✏️ Bút ghi chú — khoanh tròn chi tiết quan trọng

Mang theo bộ kit khi đi thực địa để có trải nghiệm tốt nhất!',NULL);
INSERT INTO help_sections VALUES ('checkpoint','📍','Cách tìm checkpoint',NULL,'Mỗi trạm tương ứng với một địa điểm thực tế:

• Trạm 01 — Cổng Văn Miếu Môn (lối vào chính)
• Trạm 02 — Cổng Đại Trung Môn (thứ hai)
• Trạm 03 — Lầu Khuê Văn Các
• Trạm 04 — Khu vực Bia Tiến Sĩ & Giếng
• Trạm 05 — Cổng Đại Thành Môn
• Trạm 06 — Điện Đại Thành
• Trạm 07 — Khu Nhà Thái Học (cuối)

Di chuyển theo thứ tự từ Nam lên Bắc.',NULL);
INSERT INTO help_sections VALUES ('hints','💡','Gợi ý khi gặp khó khăn',NULL,'Nếu bạn không tìm ra đáp án:

• Nhấn 💡 Gợi ý — Văn Đồng sẽ chỉ dẫn thêm
• Quay lại quan sát thực tế — câu trả lời luôn ở trước mắt bạn
• Đọc lại phần mô tả nhiệm vụ cẩn thận hơn
• Nhờ đồng đội cùng quan sát
• Đặt điện thoại xuống và nhìn xung quanh!

Không có giới hạn số lần thử — cứ tự tin khám phá nhé!',NULL);
INSERT INTO help_sections VALUES ('contact','📬','Liên hệ hỗ trợ',NULL,'Cần hỗ trợ thêm? Liên hệ chúng tôi:

• 📧 Email: support@matmathanglong.vn
• 🌐 Website: matmathanglong.vn
• 📍 Văn phòng: Văn Miếu – Quốc Tử Giám,
   58 Quốc Tử Giám, Đống Đa, Hà Nội
• ⏰ Giờ hỗ trợ: 8:00 – 17:00 hàng ngày

Chúng tôi luôn sẵn sàng giúp đỡ bạn!',NULL);
INSERT INTO site_positions VALUES (1,215,1478);
INSERT INTO site_positions VALUES (2,215,1262);
INSERT INTO site_positions VALUES (3,215,1065);
INSERT INTO site_positions VALUES (4,215,720);
INSERT INTO site_positions VALUES (5,215,568);
INSERT INTO site_positions VALUES (6,215,390);
INSERT INTO site_positions VALUES (7,215,182);