export type Language = 'vi' | 'en'

const translations: Record<string, string> = {
  "Ngôn ngữ": "Language",
  "Tiếng Việt": "Vietnamese",
  "Tiếng Anh": "English",
  "Trang chủ": "Home",
  "Bộ sưu tập": "Collection",
  "Bản đồ hành trình": "Journey Map",
  "Nhiệm vụ hiện tại": "Current mission",
  "Bạn đang ở đây": "You are here",
  "Bản đồ": "Map",
  "trạm": "checkpoints",
  "nhiệm vụ": "missions",
  "Bắt đầu hành trình khám phá!": "Start your exploration journey!",
  "Đã khám phá": "Discovered",
  "Chưa mở khóa": "Locked",
  "Chào mừng trở lại,": "Welcome back,",
  "Sĩ tử! 🎓": "Scholar! 🎓",
  "Hồ sơ": "Profile",
  "Hành trình của tôi": "My Journey",
  "Thành tựu": "Achievements",
  "Chứng nhận": "Certificate",
  "Trợ giúp": "Help",
  "Hướng dẫn · FAQ · Liên hệ": "Guide · FAQ · Contact",
  "Sẵn sàng nhận chứng nhận": "Certificate ready",
  "Tiến trình 7 trạm": "7-checkpoint progress",
  "Con dấu": "Stamps",
  "Manh mối": "Clues",
  "Vật phẩm": "Item",
  "Điểm": "POINTS",
  "Cấp": "Level",
  "Đội Thám Tử": "Detective Team",
  "Chưa bắt đầu · 5 thử thách đang chờ": "Not started · 5 challenges waiting",
  "Tiếp tục hành trình": "Continue journey",
  "điểm": "points",
  "con dấu": "stamps",
  "Xem tất cả →": "View all →",
  "Xem bộ sưu tập": "View collection",
  "Hành trình sĩ tử": "Scholar Journey",
  "Xem hành trình →": "View journey →",
  "Thành tựu mới": "Latest achievement",
  "Hoàn thành thử thách để mở khóa thành tựu!": "Complete challenges to unlock achievements!",
  "Tiến trình thử thách": "Challenge progress",
  "Phần thưởng:": "Reward:",
  "Đã hoàn thành": "Completed",
  "Nhiệm vụ": "Mission",
  "Gợi ý": "Hint",
  "Tiếp →": "Next →",
  "Chính xác!": "Correct!",
  "Thử lại thôi!": "Try again!",
  "Chưa chính xác": "Not quite",
  "HOÀN THÀNH TRẠM": "CHECKPOINT COMPLETE",
  "CHÚC MỪNG!": "CONGRATULATIONS!",
  "CHÚC MỪNG, SĨ TỬ!": "CONGRATULATIONS, SCHOLAR!",
  "Mô tả văn hoá": "Cultural description",
  "Tìm thấy tại": "Found at",
  "Đã thu thập!": "Collected!",
  "Đang khám phá": "Exploring",
  "Hiện tại": "Current",
  "Đạt!": "Done!",
  "QUAN SÁT": "OBSERVE",
  "KIẾN THỨC": "KNOWLEDGE",
  "KHÁM PHÁ": "EXPLORE",
  "5 thử thách": "5 challenges",
  "Quan sát & giải đố": "Observe & solve puzzles",
  "Vật phẩm sưu tập": "Collectible items",
  "Tổng điểm thưởng": "Total reward points",
  "⏳ Đang kiểm tra…": "⏳ Checking…",
  "✅ Xác nhận": "✅ Confirm",
  "Phổ thông": "Common",
  "Hiếm": "Rare",
  "Huyền thoại": "Legendary",
  "Điểm tích lũy": "Points earned",
  "Manh mối khám phá": "Clues discovered",
  "Di vật thu thập": "Relics collected",
  "Tất cả": "All",
  "Linh vật": "Guardian",
  "Kiến trúc": "Architecture",
  "Biểu tượng": "Symbol",
  "Học Sinh": "Student",
  "Tú Tài": "Baccalaureate",
  "Cử Nhân": "Bachelor",
  "Tiến Sĩ": "Doctor",
  "Trạng Nguyên": "Top Scholar",
  "Thử lại": "Try again",
  "Xem gợi ý": "View hint",
  "Quay lại bộ sưu tập": "Back to collection",
  "Thu thập": "Collect",
  "Câu tiếp →": "Next question →",
  "Chưa mở": "Locked",
  "Khám phá lại": "Explore again",
  "Bắt đầu khám phá": "Start exploring",
  "Văn Miếu – Quốc Tử Giám, Hà Nội": "Temple of Literature – Imperial Academy, Hanoi",
  "Văn Miếu Môn": "Van Mieu Gate",
  "Đại Trung Môn": "Dai Trung Gate",
  "Khuê Văn Các": "Khue Van Pavilion",
  "Giếng Thiên Quang & Bia Tiến Sĩ": "Thien Quang Well & Doctoral Stelae",
  "Đại Thành Môn": "Dai Thanh Gate",
  "Điện Đại Thành": "Dai Thanh Shrine",
  "Nhà Thái Học": "Thai Hoc Hall",
  "Dấu Văn Miếu Môn": "Van Mieu Gate Stamp",
  "Dấu Đại Trung": "Dai Trung Stamp",
  "Dấu Khuê Văn": "Khue Van Stamp",
  "Dấu Bia Tiến Sĩ": "Doctoral Stelae Stamp",
  "Dấu Đại Thành": "Dai Thanh Stamp",
  "Dấu Điện Thờ": "Shrine Stamp",
  "Dấu Đại Học Sĩ": "Grand Scholar Stamp",
  "Dấu ấn": "Stamp",
  "Đích: Nhà Thái Học": "Destination: Thai Hoc Hall",
  "Bắt đầu: Văn Miếu Môn": "Start: Van Mieu Gate",
  "thử thách": "challenges",
  "dấu ấn": "stamps",
  "Cách chơi": "How to play",
  "Cách sử dụng bộ kit": "How to use the kit",
  "Cách tìm checkpoint": "How to find checkpoints",
  "Gợi ý khi gặp khó khăn": "Hints when stuck",
  "Liên hệ hỗ trợ": "Support contact",
  "Về trang chủ": "Back to home",
  "Chào đệ! Ta ở đây để giúp đệ chinh phục Văn Miếu. Hỏi bất cứ điều gì — ta biết tất cả bí mật nơi này!": "Hello! I am here to help you explore the Temple of Literature. Ask me anything — I know all its secrets!",
  "Nhận nhiệm vụ": "Take on the task",
  "đã mở khóa": "unlocked",
  "Album thám tử": "Detective album",
  "Tiến độ hành trình": "Journey progress",
  "TRẠM TIẾP THEO": "NEXT CHECKPOINT",
  "Manh mối vừa khám phá": "Clue just discovered",
  "Hoàn thành các nhiệm vụ trong bản đồ để mở khóa thêm vật phẩm!": "Complete the tasks on the map to unlock more items!",
  "Hoàn thành": "Complete",
  "thu thập": "Collect",
  "Toàn bộ": "All",
  "Phần thưởng hoàn thành": "Completion reward",
  "di vật": "relic",
  "Đặt điện thoại xuống và quan sát thực tế xung quanh bạn!": "Put your phone down and look around you in the real world!",
  "Tôi đã tìm thấy!": "I found it!",
  "Câu hỏi": "Question",
  "đáp án đúng": "correct answer",
  "\"Hãy quan sát thêm một lần nữa — câu trả lời đang đứng ngay trước mắt đệ!\"": "\"Take another look — the answer is right in front of you!\"",
  "CHÍNH XÁC!": "Exactly!",
  "Vật phẩm mới": "New Items",
  "mới mở khóa!": "just unlocked!",
  "Gợi ý từ Văn Đồng": "Suggestions from Văn Đồng",
  "Quay lại câu đố": "Back to the quiz",
  "Dấu son mới thu thập": "Seal Collected",
  "Thêm vào bộ sưu tập dấu son!": "Add to Collection",
  "Hộ chiếu khám phá": "Discovery passport",
  "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM": "SOCIALIST REPUBLIC OF VIETNAM",
  "con dấu đã thu thập": "Collected Seal",
  "Hộ chiếu": "Passport",
  "Hành trình của bạn": "Your journey",
  "thành tựu đã mở khóa": "achievement unlocked",
  "\"Học không biết chán, dạy không biết mỏi.\" — Tiếp tục hành trình để mở khóa thêm thành tựu!": "\"Learn without ever tiring, teach without ever wearying.\" — Continue your journey to unlock more achievements!",
  "câu đố": "riddle",
  "Lưu": "Save",
  "Chia sẻ": "Share",
  "Đã lưu": "Saved",
  "Đã sao chép": "Copied",
  "CHỨNG NHẬN HOÀN THÀNH":"Completion Certificate",
  "Chứng nhận rằng":"Certifying that",
  "đã hoàn thành toàn bộ hành trình khám phá":"has completed the entire journey of exploration",
  "với":"with",
  "và":"and",
  "Bậc thầy Thăng Long":"Master of Thang Long",
  "Thành tựu tối cao":"Ultimate achievement",
  "Ngày hoàn thành":"Completion date",
  "\"Chào đệ! Ta ở đây để giúp đệ chinh phục Văn Miếu. Hỏi bất cứ điều gì — ta biết tất cả bí mật nơi này!\"":"\"Hello, young scholar! I'm here to help you conquer the Temple of Literature. Ask me anything — I know all the secrets of this place!\"",
  "Văn Đồng hướng dẫn":"Van Dong guide",
  "phút":"minute",
  "hàng ngày. Hành trình kéo dài khoảng":"every day. The journey lasts about",
  "Văn Miếu – Quốc Tử Giám mở cửa từ":"The Temple of Literature – Imperial Academy is open from",
  "Vật phẩm này đã được thêm vào bộ sưu tập của bạn.":"This item has been added to your collection.",
  "tại":"at",
  "để thu thập vật phẩm này.":"to collect this item.",
  "Đăng xuất":"Log out"

}

let currentLanguage: Language = 'vi'
export function setCurrentLanguage(language: Language) { currentLanguage = language }
export function getCurrentLanguage() { return currentLanguage }

export function translateText(text: string, language: Language = currentLanguage): string {
  if (language === 'vi') return text
  if (translations[text]) return translations[text]
  let result = text
  result = result.replace(/^TRẠM TIẾP THEO\s*:\s*(\d+\/\d+)$/i, 'NEXT CHECKPOINT: $1')
  result = result.replace(/^Trạm tiếp theo\s*:\s*(\d+\/\d+)$/i, 'Next checkpoint: $1')
  result = result.replace(/^Hoàn thành (\d+)\/7 trạm$/, 'Complete $1/7 checkpoints')
  result = result.replace(/Trạm (\d+) · Quan sát (\d+)\/5/g, 'Checkpoint $1 · Observation $2/5')
  result = result.replace(/TRẠM (\d+) \/ 07/g, 'CHECKPOINT $1 / 07')
  result = result.replace(/Cấp (\d+)/g, 'Level $1')
  result = result.replace(/(\d+) trạm/g, '$1 checkpoints')
  result = result.replace(/(\d+) nhiệm vụ/g, '$1 missions')
  result = result.replace(/(\d+) thử thách/g, '$1 challenges')
  result = result.replace(/Còn (\d+) câu đố/g, '$1 puzzles remaining')
  return result
}

export function translateDom(root: HTMLElement, language: Language = currentLanguage) {
  if (language === 'vi') return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) nodes.push(node as Text)
  for (const textNode of nodes) {
    const parent = textNode.parentElement
    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue
    const original = textNode.nodeValue ?? ''
    if (!original.trim()) continue
    const translated = translateText(original, language)
    if (translated !== original) textNode.nodeValue = translated
  }
}
