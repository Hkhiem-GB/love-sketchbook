import { GiftData } from '../types';

export const DEFAULT_MOCK_GIFT: GiftData = {
  id: 'demo-20-10',
  slug: 'love-demo',
  recipient_name: 'Bé Yêu',
  sender_name: 'Anh',
  opening_message: 'Một cuốn sổ nhỏ lưu giữ những điều ngọt ngào nhất...',
  messages: [
    'Chào em, cô gái hay cười và yêu những nét vẽ mộc mạc của anh!',
    'Mỗi ngày trôi qua bên em là một trang giấy trắng được tô thêm màu sắc ấm áp...',
    'Từ những buổi hẹn hò dưới mưa, ly cà phê sáng sớm, đến những cái nắm tay thật chặt.',
    'Hôm nay, tất cả kỷ niệm ấy cùng nở rộ thành một Cây Tình Yêu kỳ diệu dành riêng cho em.',
    'Chúc em ngày 20/10 tràn ngập nụ cười, luôn hạnh phúc và an yên bên anh nhé! ❤️'
  ],
  closing_message: 'Mỗi nét vẽ là một lời thương gửi đến em. Yêu em rất nhiều!',
  photos: [
    {
      id: 'p1',
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
      caption: 'Nụ cười của em',
      rotation: -2,
    },
    {
      id: 'p2',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
      caption: 'Buổi chiều bình yên',
      rotation: 3,
    },
    {
      id: 'p3',
      url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
      caption: 'Tay trong tay',
      rotation: -1,
    },
    {
      id: 'p4',
      url: 'https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&w=600&q=80',
      caption: 'Chuyến đi đầu tiên',
      rotation: 2,
    },
    {
      id: 'p5',
      url: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80',
      caption: 'Góc quán quen',
      rotation: -3,
    },
    {
      id: 'p6',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      caption: 'Ánh mắt thương mến',
      rotation: 1,
    },
    {
      id: 'p7',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
      caption: 'Những ngày nắng đẹp',
      rotation: -2,
    },
    {
      id: 'p8',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      caption: 'Kỷ niệm mùa thu',
      rotation: 3,
    },
    {
      id: 'p9',
      url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      caption: 'Dưới vòm hoa nở',
      rotation: -1,
    },
    {
      id: 'p10',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      caption: 'Mãi bên nhau nhé!',
      rotation: 2,
    }
  ],
  created_at: new Date().toISOString()
};
