import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sun,
  Moon,
  Plus,
  Search,
  Clock,
  BookOpen,
  FolderGit2,
  Edit3,
  Trash2,
  Download,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  Tag,
  Flame,
  FileText,
  Check,
  X,
  Eye,
  Code,
  Sparkles,
  Save,
  Send,
  Calendar,
  Copy,
  Share2,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Columns,
  Lock,
  LogOut,
  ShieldCheck,
  EyeOff,
  Link2,
  KeyRound,
  Settings,
  Image as ImageIcon,
  Upload,
  Pin,
  List,
  ZoomIn,
  Heart,
  Phone,
  MessageCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  increment
} from 'firebase/firestore';

// ============================================================================
// CẤU HÌNH FIREBASE & ADMIN
// ============================================================================
const PRODUCTION_ADMIN_EMAIL = 'trinhthoai045@gmail.com';
const PRODUCTION_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBrizoOBN3YeE2IM95SjoxoNqXULhqFPQ0',
  authDomain: 'tlap-blog.firebaseapp.com',
  projectId: 'tlap-blog',
  storageBucket: 'tlap-blog.firebasestorage.app',
  messagingSenderId: '237657776988',
  appId: '1:237657776988:web:99405ece05efd375375799',
  measurementId: 'G-JGRLR5JKCK'
};

const IS_PREVIEW_ENV = typeof __firebase_config !== 'undefined';
const firebaseConfig = IS_PREVIEW_ENV
  ? JSON.parse(__firebase_config)
  : PRODUCTION_FIREBASE_CONFIG;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'blog-30-phut';

let app = null;
let auth = null;
let db = null;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('Lỗi khởi tạo Firebase:', err);
  }
}

// ============================================================================
// HẰNG SỐ & HÀM TIỆN ÍCH
// ============================================================================
const LEGACY_30M_BADGE = 'Thử thách 30 phút viết mỗi ngày';
const LEGACY_30M_FOOTER = 'Xây dựng thói quen 30 phút viết mỗi ngày.';
const LEGACY_30M_BIO =
  'Xin chào! Mình là Thoại. Đây là không gian lưu trữ những dự án cá nhân mình đang xây dựng và các kiến thức chắt lọc được qua từng ngày.\n\nMỗi tối mình dành 30 phút để viết lại một điều mới — vừa để hệ thống hóa tư duy, vừa để lưu lại dấu ấn trên hành trình học hỏi.';

const DEFAULT_PROFILE = {
  blogName: 'TLAP',
  logoSubtitle: '2026',
  heroBadge: 'Ghi chép & Dự án cá nhân',
  tagline: 'Ghi chép hành trình xây dựng dự án, tư duy lập trình và những bài học tích lũy mỗi ngày.',
  footerText: 'Lưu giữ hành trình học tập và dự án.',
  showStats: true,
  authorName: 'Thoại',
  bio: 'Xin chào! Mình là Thoại. Đây là không gian lưu trữ những dự án cá nhân mình đang xây dựng và các kiến thức chắt lọc được qua từng ngày.\n\nMình thường xuyên viết lại những điều mới học được — vừa để hệ thống hóa tư duy, vừa để lưu lại dấu ấn trên hành trình học hỏi.',
  phone: '',
  zalo: '',
  facebook: '',
  github: 'https://github.com',
  website: '',
  email: 'trinhthoai045@gmail.com'
};

function buildZaloHref(raw = '') {
  const clean = raw.trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  const digits = clean.replace(/[^0-9]/g, '');
  return digits ? `https://zalo.me/${digits}` : '';
}

function buildPhoneHref(raw = '') {
  const clean = raw.trim().replace(/[^0-9+]/g, '');
  return clean ? `tel:${clean}` : '';
}

const TLAP_FAVICON_DATA_URI =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">' +
      '<rect width="64" height="64" rx="14" fill="#111113"/>' +
      '<g transform="translate(14,14) scale(1.2)" fill="#FFFFFF">' +
      '<path d="M10 0H30V20H20V10H10V0Z"/>' +
      '<path d="M0 10H10V20H20V30H10A10 10 0 0 1 0 20V10Z"/>' +
      '</g></svg>'
  );

function formatDateVN(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function countWords(text = '') {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#*`>-]/g, ' ')
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

function calculateReadingTime(text = '') {
  const words = countWords(text);
  const mins = Math.max(1, Math.ceil(words / 220));
  return `${mins} phút đọc`;
}

function slugifyHeading(text = '') {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'muc'
  );
}

function extractHeadings(content = '') {
  const lines = content.split('\n');
  const headings = [];
  let inCode = false;

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      return;
    }
    if (inCode) return;

    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      if (text) {
        headings.push({ level: 2, text, id: `${slugifyHeading(text)}-${idx}` });
      }
    } else if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      if (text) {
        headings.push({ level: 3, text, id: `${slugifyHeading(text)}-${idx}` });
      }
    }
  });

  return headings;
}

function calculateWritingStreak(publishedPosts = []) {
  if (!publishedPosts.length) return 0;
  const dayKeys = new Set(
    publishedPosts
      .filter((p) => p.createdAt)
      .map((p) => {
        const d = new Date(p.createdAt);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      })
  );

  let streak = 0;
  const cursor = new Date();
  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth() + 1}-${cursor.getDate()}`;

  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}-${cursor.getDate()}`;
    if (dayKeys.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

async function hashPasscode(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`tlap-salt-${text}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function compressImageFile(file, maxWidth = 1000, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Không thể đọc định dạng ảnh này.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp từ máy tính.'));
    reader.readAsDataURL(file);
  });
}

function downloadPostAsMarkdown(post) {
  const frontmatter = [
    '---',
    `title: "${(post.title || '').replace(/"/g, '\\"')}"`,
    `date: "${formatDateVN(post.createdAt)}"`,
    `category: "${post.category || 'knowledge'}"`,
    `tags: [${(post.tags || []).map((t) => `"${t}"`).join(', ')}]`,
    '---',
    '',
    post.content || ''
  ].join('\n');

  const blob = new Blob([frontmatter], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugifyHeading(post.title || 'bai-viet')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function createSeedPosts() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      title: 'Tại sao mình bắt đầu thói quen viết chia sẻ mỗi ngày?',
      category: 'knowledge',
      summary:
        'Viết không chỉ để chia sẻ với người khác, mà là cách tốt nhất để kiểm tra xem mình có thực sự hiểu điều mình vừa học hay chưa.',
      tags: ['Thói quen', 'Tư duy', 'Viết lách'],
      isPinned: true,
      status: 'published',
      createdAt: now,
      updatedAt: now,
      content: `## Bắt đầu từ những ghi chép nhỏ

Trước đây mình thường lưu rất nhiều bài viết hay, xem nhiều video hướng dẫn, nhưng chỉ sau vài tuần là quên gần hết. Lý do rất đơn giản: **mình chỉ tiêu thụ thông tin chứ chưa tự diễn đạt lại bằng ngôn ngữ của chính mình**.

### Duy trì nhịp viết đều đặn

Thay vì đặt mục tiêu viết một bài thật dài hay thật hoàn hảo, mình giữ thói quen ghi chép ngắn gọn mỗi ngày:

1. Chọn một vấn đề vừa gặp trong ngày hoặc một tính năng vừa làm xong.
2. Mở trình soạn thảo và ghi lại các ý chính quan trọng nhất.
3. Viết liền mạch theo cấu trúc: *Vấn đề là gì → Cách giải quyết → Bài học rút ra*.

> "Nếu bạn không thể giải thích một điều gì đó một cách đơn giản, nghĩa là bạn chưa hiểu nó đủ sâu."

Hy vọng khu vườn số **TLAP** này sẽ là nơi lưu giữ những bước tiến nhỏ nhưng đều đặn qua từng ngày.`
    },
    {
      title: 'TLAP Blog — Hệ thống ghi chép & lưu trữ dự án cá nhân',
      category: 'project',
      summary:
        'Xây dựng trang blog tối giản tích hợp trình soạn thảo Markdown song song, tự động tạo mục lục và phân quyền Admin bảo mật.',
      tags: ['React', 'TailwindCSS', 'Firebase'],
      projectStatus: 'Hoàn thành',
      demoUrl: '',
      githubUrl: 'https://github.com',
      isPinned: false,
      status: 'published',
      createdAt: now - day,
      updatedAt: now - day,
      content: `## Mục tiêu của dự án

Mình muốn có một trang blog của riêng mình với 3 tiêu chí cốt lõi:

- **Tập trung vào nội dung:** Giao diện nền giấy ấm dịu mắt, hỗ trợ chế độ Sáng/Tối và tự động tạo mục lục cho bài dài.
- **Viết nhanh không rào cản:** Trình soạn thảo Markdown trực quan, dán ảnh trực tiếp bằng \`Ctrl + V\` và tự động nén nhẹ.
- **Bảo mật tuyệt đối:** Độc giả xem trang mượt mà không cần đăng nhập; chỉ duy nhất tài khoản Admin mới có quyền viết, chỉnh sửa và quản lý bản nháp.

## Kiến trúc công nghệ

\`\`\`javascript
// Đồng bộ dữ liệu thời gian thực với Firestore
const postsQuery = query(
  postsColRef,
  where('status', '==', 'published')
);
\`\`\`

Toàn bộ dữ liệu được lưu trữ trên Cloud Firestore và triển khai miễn phí qua Vercel.`
    },
    {
      title: '3 nguyên tắc giữ cho code React luôn gọn gàng khi dự án lớn dần',
      category: 'knowledge',
      summary:
        'Những kinh nghiệm thực tế giúp tránh tình trạng component phình to, khó bảo trì và rối rắm state.',
      tags: ['React', 'Clean Code', 'Frontend'],
      isPinned: false,
      status: 'published',
      createdAt: now - 2 * day,
      updatedAt: now - 2 * day,
      content: `## 1. Đừng lưu những gì có thể tính toán được

Một lỗi phổ biến khi mới viết React là tạo quá nhiều \`useState\` cho những dữ liệu vốn có thể suy ra từ state gốc (ví dụ: danh sách đã lọc theo từ khóa hoặc số lượng bài viết).

Thay vì đồng bộ thủ công bằng \`useEffect\`, hãy dùng \`useMemo\`:

\`\`\`javascript
const filteredPosts = useMemo(() => {
  return posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [posts, searchQuery]);
\`\`\`

## 2. Tách các hàm xử lý dữ liệu thuần túy ra khỏi UI

Các hàm định dạng ngày tháng, đếm số từ, nén ảnh hay trích xuất mục lục không phụ thuộc vào giao diện. Tách chúng thành các hàm độc lập giúp code dễ đọc và dễ kiểm thử hơn rất nhiều.

## 3. Đặt tên biến thể hiện rõ ý định

Hãy ưu tiên những cái tên rõ nghĩa như \`canEdit\`, \`isUploadingImage\`, \`selectedPostHeadings\` thay vì viết tắt mơ hồ.`
    }
  ];
}

// ============================================================================
// LOGO THƯƠNG HIỆU TLAP & ICON MẠNG XÃ HỘI (SVG SẮC NÉT)
// ============================================================================
function ZaloIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5C6.48 2.5 2 6.53 2 11.5c0 2.74 1.37 5.2 3.53 6.84-.18 1.07-.65 2.27-1.36 3.13-.22.27-.01.67.33.62 1.66-.24 3.4-.83 4.62-1.46.92.24 1.89.37 2.88.37 5.52 0 10-4.03 10-9.5S17.52 2.5 12 2.5Z"
        fill="currentColor"
      />
      <path
        d="M8.4 8.3h7.2l-7.2 6.8h7.2"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZaloCircleBadge() {
  return (
    <span className="w-12 h-12 rounded-full bg-[#0068FF] text-white shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
      <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9" aria-hidden="true">
        <path
          d="M24 6C13.5 6 5 13.4 5 22.6c0 5.1 2.6 9.6 6.8 12.6-.3 2.1-1.2 4.3-2.5 5.9-.4.5 0 1.2.6 1.1 3.1-.4 6.4-1.5 8.6-2.7 1.7.4 3.6.7 5.5.7 10.5 0 19-7.4 19-16.6S34.5 6 24 6Z"
          fill="#FFFFFF"
        />
        <text
          x="24"
          y="27"
          textAnchor="middle"
          fill="#0068FF"
          fontSize="13.5"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.3"
        >
          Zalo
        </text>
      </svg>
    </span>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TlapLogoMark({ className = 'w-8 h-8' }) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TLAP Logo"
    >
      {/* Khối vuông trên phải */}
      <path d="M10 0H30V20H20V10H10V0Z" fill="currentColor" />
      {/* Khối bo góc dưới trái */}
      <path d="M0 10H10V20H20V30H10A10 10 0 0 1 0 20V10Z" fill="currentColor" />
    </svg>
  );
}

// ============================================================================
// CỤM NÚT LIÊN HỆ NỔI GÓC PHẢI DƯỚI (ZALO, FACEBOOK, PHONE)
// ============================================================================
function FloatingContactWidget({ profile }) {
  const zaloHref = buildZaloHref(profile?.zalo);
  const facebookHref = (profile?.facebook || '').trim();
  const phoneHref = buildPhoneHref(profile?.phone);
  const hasAnyContact = Boolean(zaloHref || facebookHref || phoneHref);

  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return true;
  });

  if (!hasAnyContact) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 select-none">
      {expanded && (
        <div className="flex flex-col items-end gap-3">
          {zaloHref && (
            <a
              href={zaloHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5"
            >
              <span className="relative px-3.5 py-2 rounded-lg bg-[#0068FF] text-white text-xs sm:text-sm font-bold shadow-md group-hover:bg-[#0056D6] transition-colors whitespace-nowrap">
                Zalo
                <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-[#0068FF] group-hover:border-l-[#0056D6] transition-colors" />
              </span>
              <ZaloCircleBadge />
            </a>
          )}

          {facebookHref && (
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5"
            >
              <span className="relative px-3.5 py-2 rounded-lg bg-[#1877F2] text-white text-xs sm:text-sm font-bold shadow-md group-hover:bg-[#1464CC] transition-colors whitespace-nowrap">
                Facebook
                <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-[#1877F2] group-hover:border-l-[#1464CC] transition-colors" />
              </span>
              <span className="w-12 h-12 rounded-full bg-[#1877F2] text-white shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <FacebookIcon className="w-6 h-6" />
              </span>
            </a>
          )}

          {phoneHref && (
            <a
              href={phoneHref}
              className="group flex items-center gap-2.5"
            >
              <span className="relative px-3.5 py-2 rounded-lg bg-[#68B817] text-white text-xs sm:text-sm font-bold shadow-md group-hover:bg-[#5AA112] transition-colors whitespace-nowrap">
                Phone
                <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-[#68B817] group-hover:border-l-[#5AA112] transition-colors" />
              </span>
              <span className="w-12 h-12 rounded-full bg-[#68B817] text-white shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5 fill-current" />
              </span>
            </a>
          )}
        </div>
      )}

      {/* Nút đóng / mở màu cam */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-label={expanded ? 'Thu gọn nút liên hệ' : 'Mở kênh liên hệ nhanh'}
        title={expanded ? 'Thu gọn' : 'Liên hệ nhanh'}
        className="relative w-12 h-12 rounded-full bg-[#F37B21] hover:bg-[#E06A12] text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
      >
        {!expanded && (
          <span className="absolute inset-0 rounded-full bg-[#F37B21] opacity-40 animate-ping pointer-events-none" />
        )}
        {expanded ? (
          <X className="w-6 h-6 stroke-[2.75]" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}

// ============================================================================
// TRÌNH HIỂN THỊ MARKDOWN SẠCH & HỖ TRỢ COPY CODE
// ============================================================================
function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-900 text-stone-100">
      <div className="flex items-center justify-between px-4 py-2 bg-stone-950/70 border-b border-stone-800 text-xs text-stone-400">
        <span className="font-mono uppercase tracking-wider">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 hover:text-stone-100 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Chép</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineMarkdown(text) {
  if (!text) return null;
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-stone-900 dark:text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-stone-200/80 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 font-mono text-[0.88em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 dark:text-amber-400 underline underline-offset-4 hover:opacity-80"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function MarkdownRenderer({ content = '', onImageClick }) {
  if (!content.trim()) {
    return (
      <p className="text-sm italic text-stone-400 dark:text-zinc-500">
        Chưa có nội dung để hiển thị...
      </p>
    );
  }

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Khối mã ```
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={`code-${i}`} language={lang} code={codeLines.join('\n')} />
      );
      i++;
      continue;
    }

    // Dòng trống
    if (!line.trim()) {
      i++;
      continue;
    }

    // Đường kẻ ngang ---
    if (/^---+$/.test(line.trim())) {
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-8 border-stone-200 dark:border-zinc-800"
        />
      );
      i++;
      continue;
    }

    // Hình ảnh độc lập ![Mô tả](url hoặc data:image/...)
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\((.+)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1].trim();
      const src = imgMatch[2].trim();
      elements.push(
        <figure key={`img-${i}`} className="my-6">
          <div className="relative group overflow-hidden rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-900">
            <img
              src={src}
              alt={alt || 'Hình ảnh minh họa'}
              loading="lazy"
              onClick={() => onImageClick && onImageClick({ src, alt })}
              className={`w-full max-h-[540px] object-contain mx-auto transition-transform duration-300 ${
                onImageClick ? 'cursor-zoom-in group-hover:scale-[1.01]' : ''
              }`}
            />
            {onImageClick && (
              <button
                type="button"
                onClick={() => onImageClick({ src, alt })}
                title="Phóng to ảnh"
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            )}
          </div>
          {alt && (
            <figcaption className="mt-2 text-center text-xs text-stone-500 dark:text-zinc-400 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // Tiêu đề
    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      elements.push(
        <h3
          key={`h3-${i}`}
          id={`${slugifyHeading(text)}-${i}`}
          className="scroll-mt-24 text-lg sm:text-xl font-bold text-stone-900 dark:text-zinc-100 mt-6 mb-2.5"
        >
          {renderInlineMarkdown(text)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      elements.push(
        <h2
          key={`h2-${i}`}
          id={`${slugifyHeading(text)}-${i}`}
          className="scroll-mt-24 text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-50 mt-8 mb-3 pb-2 border-b border-stone-200/70 dark:border-zinc-800/70"
        >
          {renderInlineMarkdown(text)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-zinc-50 mt-8 mb-4"
        >
          {renderInlineMarkdown(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Trích dẫn >
    if (line.trim().startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-5 pl-4 py-2 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-xl text-stone-700 dark:text-zinc-300 italic leading-relaxed"
        >
          {quoteLines.map((ql, idx) => (
            <p key={idx}>{renderInlineMarkdown(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Danh sách không thứ tự (- hoặc *)
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="my-4 pl-6 list-disc space-y-2 text-stone-700 dark:text-zinc-300 leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Danh sách có thứ tự (1. 2. ...)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="my-4 pl-6 list-decimal space-y-2 text-stone-700 dark:text-zinc-300 leading-relaxed"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Đoạn văn bản thường
    elements.push(
      <p
        key={`p-${i}`}
        className="my-3.5 text-[15.5px] sm:text-base text-stone-700 dark:text-zinc-300 leading-relaxed"
      >
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className="prose-custom">{elements}</div>;
}

// ============================================================================
// HỘP THOẠI ĐĂNG NHẬP / THIẾT LẬP ADMIN
// ============================================================================
function AdminAuthModal({
  isOpen,
  onClose,
  adminConfig,
  isProductionAuth,
  onSetup,
  onLogin
}) {
  const isConfigured = isProductionAuth || Boolean(adminConfig?.isConfigured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < (isProductionAuth ? 6 : 4)) {
      setError(
        isProductionAuth
          ? 'Mật khẩu Firebase cần có ít nhất 6 ký tự.'
          : 'Mật khẩu cần có ít nhất 4 ký tự.'
      );
      return;
    }

    if (!isConfigured && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSubmitting(true);
    try {
      const result = isConfigured
        ? await onLogin(cleanEmail, password)
        : await onSetup(cleanEmail, password);
      if (!result.ok) {
        setError(result.message || 'Đăng nhập thất bại.');
      } else {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              {isConfigured ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-zinc-50">
                {isConfigured ? 'Đăng nhập Quản trị' : 'Thiết lập tài khoản Quản trị'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {isConfigured
                  ? 'Dành riêng cho chủ blog.'
                  : 'Tạo email và mật khẩu quản trị cho blog.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-zinc-300 mb-1">
              Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email quản trị"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-zinc-300 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {!isConfigured && (
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-zinc-300 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 disabled:opacity-50 transition-colors"
          >
            {submitting
              ? 'Đang xác thực...'
              : isConfigured
              ? 'Đăng nhập'
              : 'Lưu & Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT CHÍNH (APP)
// ============================================================================
export default function App() {
  // Giao diện Sáng / Tối (tự nhớ lựa chọn của người đọc)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('tlap_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tlap_dark_mode', String(darkMode));
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }, [darkMode]);

  // Firebase Auth & Dữ liệu
  const [user, setUser] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  // Phân quyền Khách đọc (Public) vs Admin (Chủ blog)
  const [adminConfig, setAdminConfig] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewAsGuest, setPreviewAsGuest] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const canEdit = isAdmin && !previewAsGuest;

  // Điều hướng & Bộ lọc
  const [view, setView] = useState('home'); // 'home' | 'reader' | 'editor' | 'about'
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'project' | 'knowledge' | 'draft' | 'about'
  const [selectedPostId, setSelectedPostId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Trạng thái trình soạn thảo
  const [editingPostId, setEditingPostId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('knowledge');
  const [formSummary, setFormSummary] = useState('');
  const [formTags, setFormTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formProjectStatus, setFormProjectStatus] = useState('Đang làm');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [editorMode, setEditorMode] = useState('split'); // 'write' | 'preview' | 'split'
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState(null);

  // Tương tác độc giả (Lượt xem & Thả tim)
  const [likedPostIds, setLikedPostIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tlap_liked_posts') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const viewedPostIdsRef = useRef(new Set());
  const pendingHashPostIdRef = useRef(null);

  // Lightbox phóng to ảnh, Thanh tiến độ đọc & Nút lên đầu trang
  const [lightboxImage, setLightboxImage] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Chỉnh sửa hồ sơ
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(DEFAULT_PROFILE);

  // Hộp thoại xác nhận xóa & Thông báo Toast
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const seededOnceRef = useRef(false);
  const contentTextareaRef = useRef(null);
  const coverFileInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Tự động tích hợp Logo TLAP lên tab trình duyệt (Favicon) & Tiêu đề trang
  useEffect(() => {
    try {
      const blogTitle = profile.blogName || 'TLAP';
      document.title = `${blogTitle} — Blog cá nhân & Dự án`;

      let faviconLink = document.querySelector("link[rel~='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.type = 'image/svg+xml';
      faviconLink.href = TLAP_FAVICON_DATA_URI;
    } catch {
      // Bỏ qua nếu môi trường sandbox hạn chế chỉnh sửa head
    }
  }, [profile.blogName]);

  // Đồng bộ URL Hash (#post=ID) để chia sẻ link trực tiếp từng bài viết
  useEffect(() => {
    const applyHashFromUrl = () => {
      const hash = window.location.hash || '';
      const match = hash.match(/^#post=([^&]+)/);
      if (match && match[1]) {
        const targetId = decodeURIComponent(match[1]);
        pendingHashPostIdRef.current = targetId;
        setSelectedPostId(targetId);
        setView('reader');
      } else if (hash === '#about') {
        setActiveTab('about');
        setView('about');
      }
    };

    applyHashFromUrl();
    window.addEventListener('hashchange', applyHashFromUrl);
    return () => window.removeEventListener('hashchange', applyHashFromUrl);
  }, []);

  useEffect(() => {
    if (loadingData || !pendingHashPostIdRef.current) return;
    const targetId = pendingHashPostIdRef.current;
    pendingHashPostIdRef.current = null;
    const exists = posts.some((p) => p.id === targetId);
    if (!exists) {
      setSelectedPostId(null);
      setView('home');
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        // Bỏ qua nếu môi trường sandbox chặn history API
      }
    }
  }, [loadingData, posts]);

  // Tự động lưu bản nháp cục bộ (Auto-save LocalStorage) chống mất bài khi lỡ F5
  const editorBackupKey = useMemo(
    () => `tlap_editor_backup_${editingPostId || 'new'}`,
    [editingPostId]
  );

  useEffect(() => {
    if (view !== 'editor' || !canEdit) return;
    const timer = setTimeout(() => {
      const hasContent =
        formTitle.trim() || formContent.trim() || formSummary.trim() || formCoverImage;
      if (!hasContent) return;
      try {
        localStorage.setItem(
          editorBackupKey,
          JSON.stringify({
            title: formTitle,
            category: formCategory,
            summary: formSummary,
            tags: formTags,
            content: formContent,
            coverImage: formCoverImage,
            isPinned: formIsPinned,
            projectStatus: formProjectStatus,
            demoUrl: formDemoUrl,
            githubUrl: formGithubUrl,
            savedAt: Date.now()
          })
        );
        setAutoSavedAt(Date.now());
      } catch {
        // Bỏ qua nếu bộ nhớ trình duyệt đầy (ví dụ ảnh quá lớn)
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [
    view,
    canEdit,
    editorBackupKey,
    formTitle,
    formCategory,
    formSummary,
    formTags,
    formContent,
    formCoverImage,
    formIsPinned,
    formProjectStatus,
    formDemoUrl,
    formGithubUrl
  ]);

  // Theo dõi cuộn trang: thanh tiến độ đọc & nút lên đầu trang
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 420);

      if (view !== 'reader') {
        setReadingProgress(0);
        return;
      }
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) {
        setReadingProgress(0);
        return;
      }
      setReadingProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view, selectedPostId]);

  // --------------------------------------------------------------------------
  // BƯỚC 1: KHỞI TẠO XÁC THỰC FIREBASE
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!auth) {
      setPosts(createSeedPosts().map((p, idx) => ({ id: `local-seed-${idx}`, ...p })));
      setLoadingData(false);
      return;
    }

    if (IS_PREVIEW_ENV) {
      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error('Lỗi đăng nhập Firebase:', err);
          setLoadingData(false);
        }
      };

      initAuth();
      const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubAuth();
    }

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !currentUser.isAnonymous) {
        const isAllowedEmail =
          !PRODUCTION_ADMIN_EMAIL ||
          PRODUCTION_ADMIN_EMAIL === 'email-cua-ban@gmail.com' ||
          currentUser.email?.toLowerCase() === PRODUCTION_ADMIN_EMAIL.toLowerCase();
        setIsAdmin(isAllowedEmail);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // --------------------------------------------------------------------------
  // BƯỚC 2: ĐỒNG BỘ DỮ LIỆU FIRESTORE CÔNG KHAI
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!db) return;
    if (IS_PREVIEW_ENV && !user) return;

    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'blog_settings', 'profile');
    const postsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');

    const postsQuery =
      !IS_PREVIEW_ENV && !isAdmin
        ? query(postsColRef, where('status', '==', 'published'))
        : postsColRef;

    let latestProfile = null;
    let latestPosts = null;

    const trySeedIfNeeded = async () => {
      if (seededOnceRef.current) return;
      if (!IS_PREVIEW_ENV && !isAdmin) return;
      if (latestProfile === null || latestPosts === null) return;

      if (!latestProfile.hasSeeded && latestPosts.length === 0) {
        seededOnceRef.current = true;
        try {
          await setDoc(
            profileRef,
            { ...DEFAULT_PROFILE, ...latestProfile, hasSeeded: true },
            { merge: true }
          );
          const seedPosts = createSeedPosts();
          for (const item of seedPosts) {
            await addDoc(postsColRef, item);
          }
        } catch (err) {
          console.error('Lỗi khởi tạo dữ liệu mẫu:', err);
        }
      } else {
        seededOnceRef.current = true;
      }
    };

    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          const raw = snap.data();
          const data = {
            ...DEFAULT_PROFILE,
            ...raw,
            heroBadge:
              raw.heroBadge === LEGACY_30M_BADGE
                ? DEFAULT_PROFILE.heroBadge
                : raw.heroBadge ?? DEFAULT_PROFILE.heroBadge,
            footerText:
              raw.footerText === LEGACY_30M_FOOTER
                ? DEFAULT_PROFILE.footerText
                : raw.footerText ?? DEFAULT_PROFILE.footerText,
            bio:
              raw.bio === LEGACY_30M_BIO
                ? DEFAULT_PROFILE.bio
                : raw.bio ?? DEFAULT_PROFILE.bio
          };
          latestProfile = data;
          setProfile(data);
        } else {
          latestProfile = { ...DEFAULT_PROFILE, hasSeeded: false };
          setProfile(DEFAULT_PROFILE);
        }
        trySeedIfNeeded();
      },
      (error) => {
        console.error('Lỗi tải hồ sơ:', error);
      }
    );

    let unsubAdminConfig = () => {};
    if (IS_PREVIEW_ENV) {
      const adminConfigRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'blog_settings',
        'admin_config'
      );
      unsubAdminConfig = onSnapshot(
        adminConfigRef,
        (snap) => {
          if (snap.exists()) {
            setAdminConfig(snap.data());
          } else {
            setAdminConfig({ isConfigured: false });
          }
        },
        (error) => {
          console.error('Lỗi tải cấu hình Admin:', error);
        }
      );
    }

    const unsubPosts = onSnapshot(
      postsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        latestPosts = list;
        setPosts(list);
        setLoadingData(false);
        trySeedIfNeeded();
      },
      (error) => {
        console.error('Lỗi tải danh sách bài viết:', error);
        setLoadingData(false);
      }
    );

    return () => {
      unsubProfile();
      unsubAdminConfig();
      unsubPosts();
    };
  }, [user, isAdmin]);

  // Bảo vệ giao diện khi rời khỏi chế độ Admin
  useEffect(() => {
    if (!canEdit) {
      if (view === 'editor') setView('home');
      if (activeTab === 'draft') setActiveTab('all');
      if (editingProfile) setEditingProfile(false);
      if (view === 'reader' && selectedPostId) {
        const current = posts.find((p) => p.id === selectedPostId);
        if (current && current.status !== 'published') {
          setView('home');
          setSelectedPostId(null);
        }
      }
    }
  }, [canEdit, view, activeTab, editingProfile, selectedPostId, posts]);

  // --------------------------------------------------------------------------
  // DỮ LIỆU DẪN XUẤT
  // --------------------------------------------------------------------------
  const visiblePosts = useMemo(() => {
    const list = canEdit ? posts : posts.filter((p) => p.status === 'published');
    return [...list].sort((a, b) => {
      const pinDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [posts, canEdit]);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published');
    const drafts = posts.filter((p) => p.status === 'draft');
    const projects = visiblePosts.filter((p) => p.category === 'project');
    const streak = calculateWritingStreak(published);
    return {
      totalPosts: visiblePosts.length,
      publishedCount: published.length,
      draftCount: drafts.length,
      projectCount: projects.length,
      streak
    };
  }, [posts, visiblePosts]);

  const allTags = useMemo(() => {
    const map = new Map();
    visiblePosts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [visiblePosts]);

  const filteredPosts = useMemo(() => {
    return visiblePosts.filter((post) => {
      if (activeTab === 'project' && post.category !== 'project') return false;
      if (activeTab === 'knowledge' && post.category !== 'knowledge') return false;
      if (activeTab === 'draft' && post.status !== 'draft') return false;
      if (selectedTag && !(post.tags || []).includes(selectedTag)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = (post.title || '').toLowerCase().includes(q);
        const inSummary = (post.summary || '').toLowerCase().includes(q);
        const inContent = (post.content || '').toLowerCase().includes(q);
        const inTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));
        return inTitle || inSummary || inContent || inTags;
      }
      return true;
    });
  }, [visiblePosts, activeTab, selectedTag, searchQuery]);

  const selectedPost = useMemo(
    () => visiblePosts.find((p) => p.id === selectedPostId) || null,
    [visiblePosts, selectedPostId]
  );

  const selectedPostHeadings = useMemo(
    () => (selectedPost ? extractHeadings(selectedPost.content || '') : []),
    [selectedPost]
  );

  // Bài liền kề (Bài mới hơn / Bài cũ hơn) khi đọc
  const adjacentPosts = useMemo(() => {
    if (!selectedPost) return { newer: null, older: null };
    const readableList = visiblePosts.filter((p) => p.status === 'published' || p.id === selectedPost.id);
    const idx = readableList.findIndex((p) => p.id === selectedPost.id);
    if (idx === -1) return { newer: null, older: null };
    return {
      newer: idx > 0 ? readableList[idx - 1] : null,
      older: idx < readableList.length - 1 ? readableList[idx + 1] : null
    };
  }, [visiblePosts, selectedPost]);

  // Gợi ý tối đa 3 bài viết liên quan (ưu tiên trùng thẻ #tag, sau đó đến cùng danh mục)
  const relatedPosts = useMemo(() => {
    if (!selectedPost) return [];
    const currentTags = new Set(selectedPost.tags || []);
    return visiblePosts
      .filter((p) => p.id !== selectedPost.id && p.status === 'published')
      .map((p) => {
        const sharedTagCount = (p.tags || []).filter((t) => currentTags.has(t)).length;
        const sameCategory = p.category === selectedPost.category ? 1 : 0;
        const score = sharedTagCount * 10 + sameCategory;
        return { post: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.post.createdAt || 0) - (a.post.createdAt || 0))
      .slice(0, 3)
      .map((item) => item.post);
  }, [visiblePosts, selectedPost]);
  // --------------------------------------------------------------------------
  // XÁC THỰC ADMIN
  // --------------------------------------------------------------------------
  const handleAdminSetup = async (email, password) => {
    try {
      const passwordHash = await hashPasscode(password);
      const newConfig = {
        isConfigured: true,
        adminEmail: email,
        passwordHash,
        updatedAt: Date.now()
      };
      if (db && user) {
        const adminConfigRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'blog_settings',
          'admin_config'
        );
        await setDoc(adminConfigRef, newConfig, { merge: true });
      } else {
        setAdminConfig(newConfig);
      }
      setIsAdmin(true);
      setPreviewAsGuest(false);
      showToast('Đã thiết lập tài khoản Admin thành công! Bạn có thể bắt đầu viết bài.');
      return { ok: true };
    } catch (err) {
      console.error('Lỗi thiết lập Admin:', err);
      return { ok: false, message: 'Không thể lưu cấu hình Admin. Hãy thử lại.' };
    }
  };

  const handleAdminLogin = async (email, password) => {
    if (!IS_PREVIEW_ENV && auth) {
      try {
        if (
          PRODUCTION_ADMIN_EMAIL &&
          PRODUCTION_ADMIN_EMAIL !== 'email-cua-ban@gmail.com' &&
          email.toLowerCase() !== PRODUCTION_ADMIN_EMAIL.toLowerCase()
        ) {
          return {
            ok: false,
            message: 'Email này không phải tài khoản Admin được cấp quyền.'
          };
        }

        await signInWithEmailAndPassword(auth, email, password);
        setIsAdmin(true);
        setPreviewAsGuest(false);
        showToast('Đăng nhập Admin thành công!');
        return { ok: true };
      } catch (err) {
        console.error('Lỗi đăng nhập Firebase Auth:', err);
        const code = err?.code || '';
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/wrong-password' ||
          code === 'auth/user-not-found'
        ) {
          return { ok: false, message: 'Email hoặc mật khẩu không chính xác.' };
        }
        if (code === 'auth/too-many-requests') {
          return {
            ok: false,
            message: 'Bạn thử đăng nhập quá nhiều lần. Hãy đợi vài phút rồi thử lại.'
          };
        }
        return {
          ok: false,
          message: 'Không thể đăng nhập. Hãy kiểm tra lại kết nối mạng.'
        };
      }
    }

    try {
      const passwordHash = await hashPasscode(password);
      if (
        adminConfig?.adminEmail?.toLowerCase() === email.toLowerCase() &&
        adminConfig?.passwordHash === passwordHash
      ) {
        setIsAdmin(true);
        setPreviewAsGuest(false);
        showToast('Chào mừng Chủ blog trở lại! Chế độ Admin đã bật.');
        return { ok: true };
      }
      return { ok: false, message: 'Email hoặc mật khẩu Admin không chính xác.' };
    } catch (err) {
      console.error('Lỗi đăng nhập Admin:', err);
      return { ok: false, message: 'Có lỗi xảy ra khi kiểm tra thông tin.' };
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (!IS_PREVIEW_ENV && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Lỗi đăng xuất Firebase:', err);
    }
    setIsAdmin(false);
    setPreviewAsGuest(false);
    showToast('Đã đăng xuất khỏi chế độ Admin.');
  };

  // --------------------------------------------------------------------------
  // THAO TÁC BÀI VIẾT & HỒ SƠ
  // --------------------------------------------------------------------------
  const updateUrlHash = (nextHash) => {
    try {
      const base = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', nextHash ? `${base}${nextHash}` : base);
    } catch {
      // Bỏ qua nếu môi trường chặn thay đổi URL
    }
  };

  const restoreEditorBackupIfAvailable = (backupKey, fallbackData) => {
    try {
      const raw = localStorage.getItem(backupKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || (!parsed.title && !parsed.content)) return false;

      const isDifferent =
        parsed.title !== (fallbackData.title || '') ||
        parsed.content !== (fallbackData.content || '');
      if (!isDifferent) return false;

      setFormTitle(parsed.title || '');
      setFormCategory(parsed.category || fallbackData.category || 'knowledge');
      setFormSummary(parsed.summary || '');
      setFormTags(Array.isArray(parsed.tags) ? parsed.tags : []);
      setFormContent(parsed.content || '');
      setFormCoverImage(parsed.coverImage || '');
      setFormIsPinned(Boolean(parsed.isPinned));
      setFormProjectStatus(parsed.projectStatus || 'Đang làm');
      setFormDemoUrl(parsed.demoUrl || '');
      setFormGithubUrl(parsed.githubUrl || '');
      setAutoSavedAt(parsed.savedAt || Date.now());
      showToast('Đã khôi phục bản nháp chưa lưu từ phiên làm việc trước!');
      return true;
    } catch {
      return false;
    }
  };

  const openNewEditor = (defaultCategory = 'knowledge') => {
    if (!canEdit) return;
    setEditingPostId(null);
    setAutoSavedAt(null);
    setTagInput('');
    const restored = restoreEditorBackupIfAvailable('tlap_editor_backup_new', {
      category: defaultCategory
    });
    if (!restored) {
      setFormTitle('');
      setFormCategory(defaultCategory);
      setFormSummary('');
      setFormTags([]);
      setFormContent('');
      setFormCoverImage('');
      setFormIsPinned(false);
      setFormProjectStatus('Đang làm');
      setFormDemoUrl('');
      setFormGithubUrl('');
    }
    setEditorMode('split');
    setView('editor');
    updateUrlHash('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditEditor = (post) => {
    if (!canEdit) return;
    setEditingPostId(post.id);
    setAutoSavedAt(null);
    setTagInput('');
    const restored = restoreEditorBackupIfAvailable(`tlap_editor_backup_${post.id}`, post);
    if (!restored) {
      setFormTitle(post.title || '');
      setFormCategory(post.category || 'knowledge');
      setFormSummary(post.summary || '');
      setFormTags(post.tags || []);
      setFormContent(post.content || '');
      setFormCoverImage(post.coverImage || '');
      setFormIsPinned(Boolean(post.isPinned));
      setFormProjectStatus(post.projectStatus || 'Đang làm');
      setFormDemoUrl(post.demoUrl || '');
      setFormGithubUrl(post.githubUrl || '');
    }
    setEditorMode('split');
    setView('editor');
    updateUrlHash('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openReader = (post) => {
    setSelectedPostId(post.id);
    setView('reader');
    updateUrlHash(`#post=${encodeURIComponent(post.id)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tăng lượt xem 1 lần mỗi phiên cho bài đã xuất bản
    if (post.status === 'published' && !viewedPostIdsRef.current.has(post.id)) {
      viewedPostIdsRef.current.add(post.id);
      if (db) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
        updateDoc(docRef, { views: increment(1) }).catch(() => {});
      } else {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p))
        );
      }
    }
  };

  const handleToggleLike = async (post) => {
    if (!post) return;
    const alreadyLiked = likedPostIds.includes(post.id);
    const nextLiked = alreadyLiked
      ? likedPostIds.filter((id) => id !== post.id)
      : [...likedPostIds, post.id];
    setLikedPostIds(nextLiked);
    try {
      localStorage.setItem('tlap_liked_posts', JSON.stringify(nextLiked));
    } catch {
      // Bỏ qua nếu bị chặn localStorage
    }

    const delta = alreadyLiked ? -1 : 1;
    if (!alreadyLiked) {
      showToast('Cảm ơn bạn đã yêu thích bài viết!');
    }

    if (db) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
      updateDoc(docRef, { likes: increment(delta) }).catch(() => {});
    } else {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likes: Math.max(0, (p.likes || 0) + delta) } : p
        )
      );
    }
  };

  const handleCopyShareLink = (postToShare = selectedPost) => {
    const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const shareUrl = postToShare
      ? `${base}#post=${encodeURIComponent(postToShare.id)}`
      : window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    showToast('Đã sao chép đường link riêng của bài viết!');
  };

  const handleAddTag = (raw) => {
    const clean = raw.trim().replace(/^#/, '');
    if (!clean) return;
    if (!formTags.includes(clean)) {
      setFormTags([...formTags, clean]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const insertMarkdownSnippet = (before, after = '', placeholder = '') => {
    const el = contentTextareaRef.current;
    if (!el) {
      setFormContent((prev) => `${prev}${before}${placeholder}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = formContent.slice(start, end) || placeholder;
    const next =
      formContent.slice(0, start) + before + selected + after + formContent.slice(end);
    setFormContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleUploadCoverImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 1100, 0.8);
      setFormCoverImage(dataUrl);
      showToast('Đã tải và tối ưu ảnh bìa thành công!');
    } catch (err) {
      showToast(err.message || 'Không thể xử lý ảnh bìa.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadInlineImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 960, 0.76);
      const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
      insertMarkdownSnippet(`\n![${cleanAlt}](`, ')\n', dataUrl);
      showToast('Đã chèn ảnh vào bài viết!');
    } catch (err) {
      showToast(err.message || 'Không thể tải ảnh lên.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEditorPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) return;
        setIsUploadingImage(true);
        try {
          const dataUrl = await compressImageFile(file, 960, 0.76);
          insertMarkdownSnippet('\n![Ảnh minh họa](', ')\n', dataUrl);
          showToast('Đã dán và tối ưu ảnh vào bài viết!');
        } catch (err) {
          showToast(err.message || 'Không thể dán ảnh.', 'error');
        } finally {
          setIsUploadingImage(false);
        }
        return;
      }
    }
  };

  const handleSavePost = async (targetStatus) => {
    if (!canEdit) {
      showToast('Bạn cần đăng nhập Admin để thực hiện thao tác này.', 'error');
      return;
    }
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết trước khi lưu.', 'error');
      return;
    }

    setIsSaving(true);
    const now = Date.now();
    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      summary:
        formSummary.trim() ||
        formContent
          .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
          .replace(/[#*`>-]/g, '')
          .trim()
          .slice(0, 150) +
          (formContent.length > 150 ? '...' : ''),
      tags: formTags,
      content: formContent,
      coverImage: formCoverImage.trim(),
      isPinned: formIsPinned,
      status: targetStatus,
      projectStatus: formCategory === 'project' ? formProjectStatus : '',
      demoUrl: formCategory === 'project' ? formDemoUrl.trim() : '',
      githubUrl: formCategory === 'project' ? formGithubUrl.trim() : '',
      updatedAt: now
    };

    const approxBytes = new Blob([JSON.stringify(payload)]).size;
    if (approxBytes > 920_000) {
      setIsSaving(false);
      showToast(
        'Dung lượng ảnh trong bài vượt mức lưu miễn phí (~900KB). Hãy giảm bớt số ảnh tải trực tiếp hoặc dùng link ảnh ngoài.',
        'error'
      );
      return;
    }

    try {
      let savedId = editingPostId;
      if (db && user) {
        const postsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
        if (editingPostId) {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', editingPostId);
          await updateDoc(docRef, payload);
          setSelectedPostId(editingPostId);
        } else {
          const created = await addDoc(postsColRef, { ...payload, createdAt: now });
          savedId = created.id;
          setSelectedPostId(created.id);
        }
      } else {
        if (editingPostId) {
          setPosts((prev) =>
            prev.map((p) => (p.id === editingPostId ? { ...p, ...payload } : p))
          );
          setSelectedPostId(editingPostId);
        } else {
          const id = `local-${now}`;
          savedId = id;
          setPosts((prev) => [{ id, ...payload, createdAt: now }, ...prev]);
          setSelectedPostId(id);
        }
      }

      showToast(
        targetStatus === 'published'
          ? 'Đã xuất bản bài viết thành công!'
          : 'Đã lưu vào Bản nháp.'
      );
      try {
        localStorage.removeItem(editorBackupKey);
      } catch {
        // Bỏ qua
      }
      setAutoSavedAt(null);
      setView('reader');
      if (savedId) {
        updateUrlHash(`#post=${encodeURIComponent(savedId)}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Lỗi lưu bài viết:', err);
      showToast('Có lỗi xảy ra khi lưu bài viết. Hãy thử lại.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePostStatus = async (post) => {
    if (!canEdit || !post) return;
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      if (db && user) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
        await updateDoc(docRef, { status: nextStatus, updatedAt: Date.now() });
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, status: nextStatus, updatedAt: Date.now() } : p
          )
        );
      }
      showToast(
        nextStatus === 'published'
          ? 'Đã chuyển bài viết sang Đã xuất bản!'
          : 'Đã chuyển bài viết về Bản nháp.'
      );
    } catch (err) {
      console.error('Lỗi đổi trạng thái bài viết:', err);
      showToast('Không thể cập nhật trạng thái lúc này.', 'error');
    }
  };

  const handleTogglePin = async (post) => {
    if (!canEdit || !post) return;
    const nextPinned = !post.isPinned;
    try {
      if (db && user) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
        await updateDoc(docRef, { isPinned: nextPinned, updatedAt: Date.now() });
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, isPinned: nextPinned, updatedAt: Date.now() } : p
          )
        );
      }
      showToast(
        nextPinned
          ? 'Đã ghim bài viết lên đầu trang chủ!'
          : 'Đã bỏ ghim bài viết.'
      );
    } catch (err) {
      console.error('Lỗi ghim bài viết:', err);
      showToast('Không thể cập nhật trạng thái ghim.', 'error');
    }
  };

  const confirmDeletePost = async () => {
    if (!deleteTarget || !canEdit) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);

    try {
      if (db && user) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', targetId));
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== targetId));
      }
      if (selectedPostId === targetId) {
        setSelectedPostId(null);
        setView('home');
      }
      showToast('Đã xóa bài viết.');
    } catch (err) {
      console.error('Lỗi xóa bài viết:', err);
      showToast('Không thể xóa bài viết lúc này.', 'error');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    const updated = {
      ...profile,
      ...profileDraft,
      blogName: (profileDraft.blogName || '').trim() || DEFAULT_PROFILE.blogName,
      authorName: (profileDraft.authorName || '').trim() || DEFAULT_PROFILE.authorName,
      logoSubtitle: (profileDraft.logoSubtitle || '').trim(),
      heroBadge: (profileDraft.heroBadge || '').trim(),
      tagline: (profileDraft.tagline || '').trim(),
      footerText: (profileDraft.footerText || '').trim(),
      showStats: profileDraft.showStats !== false
    };

    try {
      if (db && user) {
        const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'blog_settings', 'profile');
        await setDoc(profileRef, updated, { merge: true });
      } else {
        setProfile(updated);
      }
      setEditingProfile(false);
      showToast('Đã cập nhật thông tin blog & hồ sơ!');
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      showToast('Không thể lưu hồ sơ lúc này.', 'error');
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSelectedTag('');
    if (tab === 'about') {
      setView('about');
      updateUrlHash('#about');
    } else {
      setView('home');
      updateUrlHash('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProjectStatusBadge = (st) => {
    switch (st) {
      case 'Hoàn thành':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Đang làm':
      case 'Đang phát triển':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Ý tưởng':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      default:
        return 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300 border-stone-200 dark:border-zinc-700';
    }
  };

  const navItems = useMemo(() => {
    const base = [
      { id: 'all', label: 'Tất cả' },
      { id: 'project', label: 'Dự án' },
      { id: 'knowledge', label: 'Kiến thức' }
    ];
    if (canEdit) {
      base.push({ id: 'draft', label: `Bản nháp (${stats.draftCount})` });
    }
    base.push({ id: 'about', label: 'Giới thiệu' });
    return base;
  }, [canEdit, stats.draftCount]);

  // ============================================================================
  // GIAO DIỆN CHÍNH
  // ============================================================================
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#111113] text-stone-800 dark:text-zinc-200 transition-colors duration-200 font-sans selection:bg-amber-200 dark:selection:bg-amber-900/60">
        {/* THANH TIẾN ĐỘ ĐỌC KHI XEM BÀI VIẾT */}
        {view === 'reader' && (
          <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
            <div
              className="h-full bg-amber-500 transition-[width] duration-150"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        )}

        {/* THANH TRẠNG THÁI CHẾ ĐỘ ADMIN */}
        {isAdmin && (
          <div className="bg-stone-900 dark:bg-zinc-950 text-stone-100 border-b border-stone-800 text-xs">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold ${
                    previewAsGuest
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{previewAsGuest ? 'Đang xem như khách' : 'Chế độ Admin'}</span>
                </span>
                <span className="hidden sm:inline text-stone-400">
                  {previewAsGuest
                    ? 'Các nút quản trị và bản nháp đang được ẩn giống giao diện người đọc.'
                    : (!IS_PREVIEW_ENV && user?.email) ||
                      adminConfig?.adminEmail ||
                      'Chủ blog'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!previewAsGuest && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDraft({ ...DEFAULT_PROFILE, ...profile });
                      setEditingProfile(true);
                      setView('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cài đặt trang</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewAsGuest((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                >
                  {previewAsGuest ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quay lại Admin</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Xem như khách</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* THANH ĐIỀU HƯỚNG (HEADER) */}
        <header className="sticky top-0 z-30 border-b border-stone-200/80 dark:border-zinc-800/80 bg-[#FAF9F6]/85 dark:bg-[#111113]/85 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Logo / Tên Blog TLAP */}
            <button
              type="button"
              onClick={() => handleNavClick('all')}
              className="flex items-center gap-2.5 text-left group min-w-0"
            >
              <TlapLogoMark className="w-8 h-8 text-stone-950 dark:text-zinc-50 shrink-0 group-hover:scale-105 transition-transform" />
              <div className="truncate flex flex-col justify-center">
                <div className="font-black text-lg sm:text-xl tracking-tight leading-none text-stone-950 dark:text-zinc-50 truncate">
                  {profile.blogName}
                </div>
                {profile.logoSubtitle && (
                  <span className="text-[10px] tracking-[0.22em] text-stone-500 dark:text-zinc-400 font-light leading-none mt-1">
                    {profile.logoSubtitle}
                  </span>
                )}
              </div>
            </button>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  (item.id === 'about' && view === 'about') ||
                  (view !== 'about' && view !== 'editor' && activeTab === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800/70'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Hành động bên phải */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Chuyển chế độ Sáng/Tối"
                className="p-2 rounded-full text-stone-600 dark:text-zinc-400 hover:bg-stone-200/70 dark:hover:bg-zinc-800 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {canEdit ? (
                <button
                  type="button"
                  onClick={() =>
                    openNewEditor(activeTab === 'project' ? 'project' : 'knowledge')
                  }
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-sm font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Viết bài mới</span>
                </button>
              ) : !isAdmin ? (
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  title="Đăng nhập chủ blog (Admin)"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-200 dark:border-zinc-800 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden border-t border-stone-200/60 dark:border-zinc-800/60 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                (item.id === 'about' && view === 'about') ||
                (view !== 'about' && view !== 'editor' && activeTab === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-stone-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* ================================================================ */}
        {/* NỘI DUNG CHÍNH THEO VIEW */}
        {/* ================================================================ */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {/* -------------------- VIEW 1: TRANG CHỦ / DANH SÁCH -------------------- */}
          {view === 'home' && (
            <div className="space-y-8">
              {/* Phần giới thiệu ngắn & Thống kê 30 phút */}
              <section className="rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    {profile.heroBadge && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{profile.heroBadge}</span>
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-50">
                      {profile.blogName}
                    </h1>
                    {profile.tagline && (
                      <p className="text-stone-600 dark:text-zinc-400 leading-relaxed">
                        {profile.tagline}
                      </p>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDraft({ ...DEFAULT_PROFILE, ...profile });
                          setEditingProfile(true);
                          setView('about');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa nội dung trang & hồ sơ</span>
                      </button>
                    )}
                  </div>

                  {/* 3 Thẻ thống kê nhỏ */}
                  {profile.showStats !== false && (
                    <div className="grid grid-cols-3 gap-3 shrink-0">
                      <div className="rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/60 p-3.5 text-center min-w-[92px]">
                        <div className="flex justify-center mb-1 text-stone-500 dark:text-zinc-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-stone-900 dark:text-zinc-50">
                          {stats.publishedCount}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                          Đã xuất bản
                        </div>
                      </div>

                      <div className="rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/60 p-3.5 text-center min-w-[92px]">
                        <div className="flex justify-center mb-1 text-indigo-500 dark:text-indigo-400">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-stone-900 dark:text-zinc-50">
                          {stats.projectCount}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                          Dự án
                        </div>
                      </div>

                      <div className="rounded-xl border border-stone-200/80 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/60 p-3.5 text-center min-w-[92px]">
                        <div className="flex justify-center mb-1 text-amber-500">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="text-xl font-bold text-stone-900 dark:text-zinc-50">
                          {stats.streak}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5">
                          Chuỗi ngày
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Thanh tìm kiếm & Bộ lọc */}
              <section className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm bài viết, dự án hoặc từ khóa..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bộ lọc theo thẻ chủ đề */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-zinc-500 mr-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Chủ đề:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag('')}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        !selectedTag
                          ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-zinc-950'
                          : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Tất cả
                    </button>
                    {allTags.map(([tag, count]) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedTag === tag
                            ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-zinc-950'
                            : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        #{tag} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Danh sách bài viết / Dự án */}
              <section>
                {loadingData ? (
                  <div className="grid gap-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 animate-pulse space-y-3"
                      >
                        <div className="h-4 w-32 rounded bg-stone-200 dark:bg-zinc-800" />
                        <div className="h-6 w-3/4 rounded bg-stone-200 dark:bg-zinc-800" />
                        <div className="h-4 w-full rounded bg-stone-100 dark:bg-zinc-800/70" />
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 p-10 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-stone-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-stone-800 dark:text-zinc-200">
                      {searchQuery || selectedTag
                        ? 'Không tìm thấy bài viết phù hợp'
                        : activeTab === 'draft'
                        ? 'Chưa có bản nháp nào'
                        : 'Chưa có bài viết nào trong mục này'}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-md mx-auto">
                      {searchQuery || selectedTag
                        ? 'Hãy thử xóa bộ lọc hoặc tìm bằng từ khóa khác.'
                        : 'Bắt đầu viết bài mới để lưu lại ý tưởng hoặc dự án mới nhất của bạn.'}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {(searchQuery || selectedTag) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedTag('');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            openNewEditor(activeTab === 'project' ? 'project' : 'knowledge')
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Viết bài mới</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'project' ? (
                  /* GIAO DIỆN PORTFOLIO GRID 2 CỘT CHO TAB DỰ ÁN */
                  <div className="grid sm:grid-cols-2 gap-5">
                    {filteredPosts.map((post) => (
                      <article
                        key={post.id}
                        onClick={() => openReader(post)}
                        className={`group cursor-pointer flex flex-col rounded-2xl border bg-white dark:bg-zinc-900/60 overflow-hidden hover:border-indigo-400/80 dark:hover:border-indigo-500/60 hover:shadow-lg transition-all ${
                          post.isPinned
                            ? 'border-amber-300/80 dark:border-amber-700/50 ring-1 ring-amber-400/20'
                            : 'border-stone-200/80 dark:border-zinc-800'
                        }`}
                      >
                        {/* Ảnh bìa lớn đầu thẻ dự án */}
                        {post.coverImage ? (
                          <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-zinc-950 border-b border-stone-200/70 dark:border-zinc-800">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {post.projectStatus && (
                              <span
                                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getProjectStatusBadge(
                                  post.projectStatus
                                )}`}
                              >
                                {post.projectStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="relative h-32 w-full bg-gradient-to-br from-indigo-50 via-stone-100 to-amber-50/70 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-zinc-950 border-b border-stone-200/70 dark:border-zinc-800 p-5 flex items-end justify-between">
                            <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                              <FolderGit2 className="w-5 h-5" />
                            </div>
                            {post.projectStatus && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getProjectStatusBadge(
                                  post.projectStatus
                                )}`}
                              >
                                {post.projectStatus}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex-1 flex flex-col p-5">
                          <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-zinc-400 mb-2">
                            <div className="flex items-center gap-1.5">
                              {post.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                  <Pin className="w-3 h-3" />
                                  Nổi bật
                                </span>
                              )}
                              {post.status === 'draft' && (
                                <span className="px-2 py-0.5 rounded-full font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                  Bản nháp
                                </span>
                              )}
                              <span>{formatDateVN(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              {(post.views || 0) > 0 && (
                                <span className="inline-flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" />
                                  {post.views}
                                </span>
                              )}
                              {(post.likes || 0) > 0 && (
                                <span className="inline-flex items-center gap-1 text-rose-500">
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                  {post.likes}
                                </span>
                              )}
                            </div>
                          </div>

                          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
                            {post.title}
                          </h2>

                          <p className="text-sm text-stone-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                            {post.summary}
                          </p>

                          {(post.tags || []).length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-4">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div
                            className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100 dark:border-zinc-800/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              {post.githubUrl && (
                                <a
                                  href={post.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                  <GithubIcon className="w-3.5 h-3.5" />
                                  <span>GitHub</span>
                                </a>
                              )}
                              {post.demoUrl && (
                                <a
                                  href={post.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-opacity"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Demo</span>
                                </a>
                              )}
                              {!post.githubUrl && !post.demoUrl && (
                                <button
                                  type="button"
                                  onClick={() => openReader(post)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  <span>Xem chi tiết</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {canEdit && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePin(post)}
                                  title={post.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    post.isPinned
                                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                                      : 'text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditEditor(post)}
                                  title="Chỉnh sửa"
                                  className="p-1.5 rounded-lg text-stone-500 dark:text-zinc-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-zinc-800"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(post)}
                                  title="Xóa"
                                  className="p-1.5 rounded-lg text-stone-500 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredPosts.map((post) => {
                      const isProject = post.category === 'project';
                      return (
                        <article
                          key={post.id}
                          onClick={() => openReader(post)}
                          className={`group cursor-pointer rounded-2xl border bg-white dark:bg-zinc-900/60 p-5 sm:p-6 hover:border-amber-400/70 dark:hover:border-amber-500/50 hover:shadow-md transition-all ${
                            post.isPinned
                              ? 'border-amber-300/80 dark:border-amber-700/50 ring-1 ring-amber-400/20'
                              : 'border-stone-200/80 dark:border-zinc-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row gap-5">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  {post.isPinned && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                      <Pin className="w-3 h-3" />
                                      Nổi bật
                                    </span>
                                  )}

                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      isProject
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                        : 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300'
                                    }`}
                                  >
                                    {isProject ? (
                                      <FolderGit2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <BookOpen className="w-3.5 h-3.5" />
                                    )}
                                    {isProject ? 'Dự án' : 'Kiến thức'}
                                  </span>

                                  {isProject && post.projectStatus && (
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProjectStatusBadge(
                                        post.projectStatus
                                      )}`}
                                    >
                                      {post.projectStatus}
                                    </span>
                                  )}

                                  {post.status === 'draft' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                                      Bản nháp
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-zinc-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDateVN(post.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {calculateReadingTime(post.content)}
                                  </span>
                                  {(post.views || 0) > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3.5 h-3.5" />
                                      {post.views}
                                    </span>
                                  )}
                                  {(post.likes || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                                      <Heart className="w-3.5 h-3.5 fill-current" />
                                      {post.likes}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-zinc-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mb-2 leading-snug">
                                {post.title}
                              </h2>

                              <p className="text-sm sm:text-[15px] text-stone-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                                {post.summary}
                              </p>
                            </div>

                            {/* Ảnh bìa thu gọn trên thẻ bài viết */}
                            {post.coverImage && (
                              <div className="sm:w-44 md:w-48 h-40 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-stone-200/80 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950">
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-stone-100 dark:border-zinc-800/80">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(post.tags || []).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded-md text-xs bg-stone-100 dark:bg-zinc-800/80 text-stone-600 dark:text-zinc-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <div
                              className="flex flex-wrap items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isProject && post.githubUrl && (
                                <a
                                  href={post.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                  <GithubIcon className="w-3.5 h-3.5" />
                                  <span>GitHub</span>
                                </a>
                              )}
                              {isProject && post.demoUrl && (
                                <a
                                  href={post.demoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-opacity"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Demo</span>
                                </a>
                              )}

                              {canEdit && (
                                <div className="flex items-center gap-1 pl-1 border-l border-stone-200 dark:border-zinc-700">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePin(post)}
                                    title={post.isPinned ? 'Bỏ ghim bài viết' : 'Ghim lên đầu trang'}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      post.isPinned
                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                                        : 'text-stone-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                                    }`}
                                  >
                                    <Pin className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePostStatus(post)}
                                    title={
                                      post.status === 'published'
                                        ? 'Chuyển về Bản nháp'
                                        : 'Xuất bản bài viết này'
                                    }
                                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                                      post.status === 'published'
                                        ? 'text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                                        : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                                    }`}
                                  >
                                    {post.status === 'published' ? 'Về nháp' : 'Xuất bản'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditEditor(post)}
                                    title="Chỉnh sửa bài viết"
                                    className="p-1.5 rounded-lg text-stone-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(post)}
                                    title="Xóa bài viết"
                                    className="p-1.5 rounded-lg text-stone-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* -------------------- VIEW 2: ĐỌC BÀI VIẾT -------------------- */}
          {view === 'reader' && selectedPost && (
            <article className="max-w-3xl mx-auto">
              {/* Thanh công cụ trên cùng */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-stone-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setView('home');
                    updateUrlHash('');
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại danh sách</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyShareLink(selectedPost)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia sẻ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadPostAsMarkdown(selectedPost);
                      showToast('Đã xuất file Markdown (.md)');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất .md</span>
                  </button>

                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(selectedPost)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selectedPost.isPinned
                            ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            : 'border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{selectedPost.isPinned ? 'Đã ghim' : 'Ghim'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePostStatus(selectedPost)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {selectedPost.status === 'published'
                            ? 'Chuyển về Nháp'
                            : 'Xuất bản ngay'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditEditor(selectedPost)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(selectedPost)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Phần đầu bài viết */}
              <header className="space-y-4 mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPost.isPinned && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                      <Pin className="w-3.5 h-3.5" />
                      Bài nổi bật
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      selectedPost.category === 'project'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {selectedPost.category === 'project' ? (
                      <FolderGit2 className="w-3.5 h-3.5" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5" />
                    )}
                    {selectedPost.category === 'project' ? 'Dự án' : 'Kiến thức'}
                  </span>

                  {selectedPost.category === 'project' && selectedPost.projectStatus && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getProjectStatusBadge(
                        selectedPost.projectStatus
                      )}`}
                    >
                      {selectedPost.projectStatus}
                    </span>
                  )}

                  {selectedPost.status === 'draft' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      Bản nháp
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-zinc-50 leading-tight">
                  {selectedPost.title}
                </h1>

                {selectedPost.summary && (
                  <p className="text-lg text-stone-600 dark:text-zinc-400 leading-relaxed">
                    {selectedPost.summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 dark:text-zinc-400 pt-2">
                  <span className="font-medium text-stone-700 dark:text-zinc-300">
                    {profile.authorName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDateVN(selectedPost.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {calculateReadingTime(selectedPost.content)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {selectedPost.views || 1} lượt xem
                  </span>
                </div>

                {/* Hộp liên kết dự án nếu là bài Dự án */}
                {selectedPost.category === 'project' &&
                  (selectedPost.demoUrl || selectedPost.githubUrl) && (
                    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 mt-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mr-auto">
                        Liên kết dự án
                      </span>
                      {selectedPost.githubUrl && (
                        <a
                          href={selectedPost.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <GithubIcon className="w-4 h-4" />
                          <span>Mã nguồn GitHub</span>
                        </a>
                      )}
                      {selectedPost.demoUrl && (
                        <a
                          href={selectedPost.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Xem bản Demo</span>
                        </a>
                      )}
                    </div>
                  )}

                {/* Ảnh bìa bài viết (nhấn để phóng to) */}
                {selectedPost.coverImage && (
                  <div className="pt-2">
                    <div
                      onClick={() =>
                        setLightboxImage({
                          src: selectedPost.coverImage,
                          alt: selectedPost.title
                        })
                      }
                      className="relative group overflow-hidden rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-900 cursor-zoom-in"
                    >
                      <img
                        src={selectedPost.coverImage}
                        alt={selectedPost.title}
                        className="w-full max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                )}
              </header>

              {/* Mục lục tự động (hiển thị khi có từ 2 mục lớn trở lên) */}
              {selectedPostHeadings.length >= 2 && (
                <nav className="mb-8 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-3">
                    <List className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Mục lục bài viết</span>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {selectedPostHeadings.map((h) => (
                      <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                        <button
                          type="button"
                          onClick={() => {
                            const target = document.getElementById(h.id);
                            if (target) {
                              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="text-left text-stone-600 dark:text-zinc-400 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                        >
                          {h.level === 3 ? '↳ ' : '• '}
                          {h.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Nội dung Markdown */}
              <div className="py-6 border-t border-stone-200/80 dark:border-zinc-800/80">
                <MarkdownRenderer
                  content={selectedPost.content}
                  onImageClick={(img) => setLightboxImage(img)}
                />
              </div>

              {/* Thanh tương tác Thả tim & Chia sẻ link bài viết */}
              <div className="flex flex-wrap items-center justify-between gap-3 py-4 px-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(selectedPost)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95 ${
                      likedPostIds.includes(selectedPost.id)
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                        : 'bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:border-rose-300 hover:text-rose-600'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedPostIds.includes(selectedPost.id) ? 'fill-current' : ''
                      }`}
                    />
                    <span>
                      {likedPostIds.includes(selectedPost.id) ? 'Đã thích' : 'Bài viết hữu ích'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-xs bg-black/5 dark:bg-white/10">
                      {selectedPost.likes || 0}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyShareLink(selectedPost)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Sao chép link bài viết</span>
                </button>
              </div>

              {/* Thẻ cuối bài */}
              {(selectedPost.tags || []).length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-6 mt-8 border-t border-stone-200/80 dark:border-zinc-800/80">
                  <Tag className="w-4 h-4 text-stone-400 mr-1" />
                  {selectedPost.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag);
                        setActiveTab('all');
                        setView('home');
                      }}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Điều hướng Bài mới hơn / Bài trước đó */}
              {(adjacentPosts.newer || adjacentPosts.older) && (
                <div className="mt-8 grid sm:grid-cols-2 gap-3">
                  {adjacentPosts.newer ? (
                    <button
                      type="button"
                      onClick={() => openReader(adjacentPosts.newer)}
                      className="group text-left p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 hover:border-amber-400/70 dark:hover:border-amber-500/50 transition-all"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-zinc-500 mb-1">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Bài mới hơn</span>
                      </div>
                      <div className="text-sm font-semibold text-stone-800 dark:text-zinc-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 line-clamp-1 transition-colors">
                        {adjacentPosts.newer.title}
                      </div>
                    </button>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {adjacentPosts.older && (
                    <button
                      type="button"
                      onClick={() => openReader(adjacentPosts.older)}
                      className="group text-left sm:text-right p-4 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 hover:border-amber-400/70 dark:hover:border-amber-500/50 transition-all"
                    >
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-stone-400 dark:text-zinc-500 mb-1">
                        <span>Bài trước đó</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-sm font-semibold text-stone-800 dark:text-zinc-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 line-clamp-1 transition-colors">
                        {adjacentPosts.older.title}
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Khu vực Gợi ý Bài viết liên quan cuối trang */}
              {relatedPosts.length > 0 && (
                <section className="mt-10 pt-8 border-t border-stone-200/80 dark:border-zinc-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-50 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Bài viết liên quan</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setView('home');
                        updateUrlHash('');
                      }}
                      className="text-xs font-medium text-stone-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      Xem tất cả →
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3.5">
                    {relatedPosts.map((relPost) => {
                      const isRelProject = relPost.category === 'project';
                      return (
                        <article
                          key={relPost.id}
                          onClick={() => openReader(relPost)}
                          className="group cursor-pointer flex flex-col rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 overflow-hidden hover:border-amber-400/70 dark:hover:border-amber-500/50 hover:shadow-md transition-all"
                        >
                          {relPost.coverImage && (
                            <div className="h-28 w-full overflow-hidden bg-stone-100 dark:bg-zinc-950 border-b border-stone-200/60 dark:border-zinc-800">
                              <img
                                src={relPost.coverImage}
                                alt={relPost.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}

                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-500 dark:text-zinc-400 mb-1.5">
                              {isRelProject ? (
                                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                  <FolderGit2 className="w-3 h-3" />
                                  Dự án
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  Kiến thức
                                </span>
                              )}
                              <span>•</span>
                              <span>{calculateReadingTime(relPost.content)}</span>
                            </div>

                            <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2">
                              {relPost.title}
                            </h3>

                            {relPost.summary && (
                              <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3 flex-1">
                                {relPost.summary}
                              </p>
                            )}

                            {(relPost.tags || []).length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-100 dark:border-zinc-800/80">
                                {relPost.tags.slice(0, 2).map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Hộp liên hệ tác giả cuối bài viết */}
              {(buildPhoneHref(profile.phone) ||
                buildZaloHref(profile.zalo) ||
                profile.facebook ||
                profile.github ||
                profile.email) && (
                <div className="mt-8 p-5 rounded-2xl border border-stone-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                      Trao đổi thêm cùng {profile.authorName}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                      Có thắc mắc về bài viết hoặc muốn hợp tác dự án? Nhắn trực tiếp cho mình nhé.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {buildPhoneHref(profile.phone) && (
                      <a
                        href={buildPhoneHref(profile.phone)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#68B817] hover:bg-[#5AA112] text-white shadow-sm transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Phone</span>
                      </a>
                    )}
                    {buildZaloHref(profile.zalo) && (
                      <a
                        href={buildZaloHref(profile.zalo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0068FF] hover:bg-[#0057D9] text-white shadow-sm transition-colors"
                      >
                        <ZaloIcon className="w-4 h-4" />
                        <span>Zalo</span>
                      </a>
                    )}
                    {profile.facebook && (
                      <a
                        href={profile.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1877F2] hover:bg-[#1464CC] text-white shadow-sm transition-colors"
                      >
                        <FacebookIcon className="w-4 h-4" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </article>
          )}

          {/* -------------------- VIEW 3: TRÌNH SOẠN THẢO (CHỈ ADMIN) -------------------- */}
          {view === 'editor' && canEdit && (
            <div className="space-y-6">
              {/* Thanh công cụ trên cùng */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setView('home')}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Hủy & Quay lại</span>
                </button>

                <div className="flex items-center gap-2">
                  {autoSavedAt && (
                    <span className="hidden lg:inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mr-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Tự động lưu nháp lúc {new Date(autoSavedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSavePost('draft')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu nháp</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSavePost('published')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 disabled:opacity-50 shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSaving ? 'Đang lưu...' : 'Xuất bản'}</span>
                  </button>
                </div>
              </div>

              {/* Thông tin bài viết */}
              <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 sm:p-6 space-y-4 shadow-sm">
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết hoặc tên dự án..."
                  className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-stone-900 dark:text-zinc-50 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1.5">
                      Danh mục
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormCategory('knowledge')}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          formCategory === 'knowledge'
                            ? 'bg-stone-900 text-white border-stone-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100'
                            : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Kiến thức</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormCategory('project')}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          formCategory === 'project'
                            ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                            : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <FolderGit2 className="w-4 h-4" />
                        <span>Dự án</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1.5">
                      Thẻ chủ đề (nhấn Enter hoặc dấu phẩy để thêm)
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 min-h-[42px] rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950">
                      {formTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setFormTags(formTags.filter((t) => t !== tag))}
                            className="hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        onBlur={() => handleAddTag(tagInput)}
                        placeholder={formTags.length === 0 ? 'React, Thói quen...' : 'Thêm thẻ...'}
                        className="flex-1 min-w-[100px] bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                    Mô tả ngắn (hiển thị ngoài trang chủ)
                  </label>
                  <input
                    type="text"
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Tóm tắt ngắn gọn nội dung chính trong 1-2 câu..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                {/* Ảnh bìa bài viết & Ghim nổi bật */}
                <div className="grid sm:grid-cols-3 gap-4 items-start pt-1">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400">
                      Ảnh bìa bài viết (tải từ máy hoặc dán link ảnh)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="url"
                        value={formCoverImage.startsWith('data:') ? '' : formCoverImage}
                        onChange={(e) => setFormCoverImage(e.target.value)}
                        placeholder={
                          formCoverImage.startsWith('data:')
                            ? 'Đã tải ảnh bìa từ máy tính'
                            : 'https://... hoặc bấm Tải ảnh từ máy'
                        }
                        className="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCoverImage}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => coverFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isUploadingImage ? 'Đang nén...' : 'Tải ảnh từ máy'}</span>
                      </button>
                      {formCoverImage && (
                        <button
                          type="button"
                          onClick={() => setFormCoverImage('')}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Gỡ ảnh</span>
                        </button>
                      )}
                    </div>

                    {formCoverImage && (
                      <div className="mt-2 relative rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950 max-h-44">
                        <img
                          src={formCoverImage}
                          alt="Xem trước ảnh bìa"
                          className="w-full h-44 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="sm:pt-5">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/80 dark:bg-zinc-950/60 cursor-pointer hover:border-amber-400/70 transition-colors">
                      <input
                        type="checkbox"
                        checked={formIsPinned}
                        onChange={(e) => setFormIsPinned(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-stone-800 dark:text-zinc-200 flex items-center gap-1">
                          <Pin className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ghim lên đầu trang</span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-zinc-400">
                          Hiển thị nhãn Nổi bật
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Trường bổ sung riêng cho Dự án */}
                {formCategory === 'project' && (
                  <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/50">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-zinc-300 mb-1">
                        Trạng thái dự án
                      </label>
                      <select
                        value={formProjectStatus}
                        onChange={(e) => setFormProjectStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <option value="Đang làm">Đang làm</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Ý tưởng">Ý tưởng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-zinc-300 mb-1">
                        Link Demo (tùy chọn)
                      </label>
                      <input
                        type="url"
                        value={formDemoUrl}
                        onChange={(e) => setFormDemoUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-zinc-300 mb-1">
                        Link GitHub (tùy chọn)
                      </label>
                      <input
                        type="url"
                        value={formGithubUrl}
                        onChange={(e) => setFormGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Khung soạn thảo Markdown + Xem trước */}
              <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/60">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('## ', '', 'Tiêu đề mục')}
                      className="px-2 py-1 rounded text-xs font-semibold text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('### ', '', 'Tiêu đề phụ')}
                      className="px-2 py-1 rounded text-xs font-semibold text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('**', '**', 'chữ đậm')}
                      className="px-2 py-1 rounded text-xs font-bold text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('*', '*', 'chữ nghiêng')}
                      className="px-2 py-1 rounded text-xs italic text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('\n- ', '', 'Mục danh sách')}
                      className="px-2 py-1 rounded text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      • Danh sách
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownSnippet('\n> ', '', 'Trích dẫn hay')}
                      className="px-2 py-1 rounded text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      “ Trích dẫn
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet('[', '](https://example.com)', 'Tên liên kết')
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet('\n```javascript\n', '\n```\n', '// Viết code tại đây')
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </button>

                    <span className="w-px h-4 bg-stone-300 dark:bg-zinc-700 mx-0.5" />

                    {/* Input ẩn tải ảnh vào nội dung */}
                    <input
                      ref={inlineImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadInlineImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => inlineImageInputRef.current?.click()}
                      title="Tải ảnh từ máy tính và chèn vào bài viết (tự nén nhẹ)"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 disabled:opacity-50 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? 'Đang nén...' : 'Tải ảnh'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdownSnippet('\n![Mô tả ảnh](', ')\n', 'https://example.com/anh.jpg')
                      }
                      title="Chèn ảnh bằng đường dẫn URL"
                      className="px-2 py-1 rounded text-xs text-stone-600 dark:text-zinc-300 hover:bg-stone-200/70 dark:hover:bg-zinc-800"
                    >
                      Link ảnh
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 dark:text-zinc-500 hidden sm:inline">
                      {countWords(formContent)} từ • {calculateReadingTime(formContent)}
                    </span>
                    <div className="flex items-center p-0.5 rounded-lg bg-stone-200/70 dark:bg-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditorMode('write')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          editorMode === 'write'
                            ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm'
                            : 'text-stone-600 dark:text-zinc-400'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Viết</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('split')}
                        className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          editorMode === 'split'
                            ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm'
                            : 'text-stone-600 dark:text-zinc-400'
                        }`}
                      >
                        <Columns className="w-3 h-3" />
                        <span>Song song</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode('preview')}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          editorMode === 'preview'
                            ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm'
                            : 'text-stone-600 dark:text-zinc-400'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem trước</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vùng nhập & xem trước */}
                <div
                  className={`grid ${
                    editorMode === 'split' ? 'md:grid-cols-2 divide-y md:divide-y-0 md:divide-x' : 'grid-cols-1'
                  } divide-stone-200 dark:divide-zinc-800`}
                >
                  {(editorMode === 'write' || editorMode === 'split') && (
                    <textarea
                      ref={contentTextareaRef}
                      rows={18}
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      onPaste={handleEditorPaste}
                      placeholder="Bắt đầu viết nội dung bằng Markdown tại đây... (Hỗ trợ ## Tiêu đề, **đậm**, *nghiêng*, > trích dẫn, danh sách, ```code``` — hoặc bấm nút Tải ảnh / dán ảnh trực tiếp bằng Ctrl+V)"
                      className="w-full p-5 bg-transparent font-mono text-sm leading-relaxed text-stone-800 dark:text-zinc-200 placeholder:text-stone-400 dark:placeholder:text-zinc-600 focus:outline-none resize-y min-h-[420px]"
                    />
                  )}

                  {(editorMode === 'preview' || editorMode === 'split') && (
                    <div className="p-5 sm:p-6 overflow-y-auto max-h-[600px] min-h-[420px] bg-stone-50/40 dark:bg-zinc-950/30">
                      <MarkdownRenderer
                        content={formContent}
                        onImageClick={(img) => setLightboxImage(img)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -------------------- VIEW 4: GIỚI THIỆU & CÀI ĐẶT HỒ SƠ -------------------- */}
          {view === 'about' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 sm:p-8 shadow-sm">
                {!editingProfile ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-stone-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-sm shrink-0">
                          <TlapLogoMark className="w-9 h-9" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-50">
                            {profile.authorName}
                          </h1>
                          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                            Tác giả của {profile.blogName}
                          </p>
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDraft({ ...DEFAULT_PROFILE, ...profile });
                            setEditingProfile(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors self-start"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Cài đặt trang & hồ sơ</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 text-stone-700 dark:text-zinc-300 leading-relaxed">
                      {profile.tagline && (
                        <p className="font-medium text-stone-900 dark:text-zinc-100">
                          {profile.tagline}
                        </p>
                      )}
                      {profile.bio && (
                        <p className="whitespace-pre-line">{profile.bio}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800">
                      {buildPhoneHref(profile.phone) && (
                        <a
                          href={buildPhoneHref(profile.phone)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#68B817] hover:bg-[#5AA112] text-white shadow-sm transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Phone</span>
                        </a>
                      )}
                      {buildZaloHref(profile.zalo) && (
                        <a
                          href={buildZaloHref(profile.zalo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0068FF] hover:bg-[#0057D9] text-white shadow-sm transition-colors"
                        >
                          <ZaloIcon className="w-4 h-4" />
                          <span>Zalo</span>
                        </a>
                      )}
                      {profile.facebook && (
                        <a
                          href={profile.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#1877F2] hover:bg-[#1464CC] text-white shadow-sm transition-colors"
                        >
                          <FacebookIcon className="w-4 h-4" />
                          <span>Facebook</span>
                        </a>
                      )}
                      {profile.github && (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <GithubIcon className="w-4 h-4" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      )}
                      {profile.email && (
                        <a
                          href={`mailto:${profile.email}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{profile.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-zinc-800">
                      <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-50 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-amber-600" />
                        <span>Cài đặt toàn bộ trang web & Hồ sơ</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Nhóm 1: Giao diện & Văn bản trang chủ */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
                        1. Giao diện & Nội dung hiển thị (để trống để ẩn)
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Tên Blog (hiển thị trên Header & Trang chủ)
                          </label>
                          <input
                            type="text"
                            value={profileDraft.blogName || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, blogName: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Chữ nhỏ dưới logo (VD: 2026 — để trống để ẩn)
                          </label>
                          <input
                            type="text"
                            value={profileDraft.logoSubtitle || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, logoSubtitle: e.target.value })
                            }
                            placeholder="VD: 2026"
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Huy hiệu nhỏ đầu trang (để trống để ẩn hoàn toàn)
                        </label>
                        <input
                          type="text"
                          value={profileDraft.heroBadge || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, heroBadge: e.target.value })
                          }
                          placeholder="VD: Ghi chép & Dự án cá nhân"
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Khẩu hiệu / Mô tả ngắn trên trang chủ (để trống để ẩn)
                        </label>
                        <input
                          type="text"
                          value={profileDraft.tagline || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, tagline: e.target.value })
                          }
                          placeholder="Mô tả ngắn về blog của bạn..."
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Dòng chữ ở chân trang (để trống để chỉ hiện © {new Date().getFullYear()} {profileDraft.blogName || profile.blogName})
                        </label>
                        <input
                          type="text"
                          value={profileDraft.footerText || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, footerText: e.target.value })
                          }
                          placeholder="VD: Lưu giữ hành trình học tập và dự án."
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Khẩu hiệu / Mô tả ngắn trên trang chủ (để trống để ẩn)
                        </label>
                        <input
                          type="text"
                          value={profileDraft.tagline || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, tagline: e.target.value })
                          }
                          placeholder="Mô tả ngắn về blog của bạn..."
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Dòng chữ ở chân trang (để trống để chỉ hiện © {new Date().getFullYear()} {profileDraft.blogName || profile.blogName})
                        </label>
                        <input
                          type="text"
                          value={profileDraft.footerText || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, footerText: e.target.value })
                          }
                          placeholder="VD: Xây dựng thói quen 30 phút viết mỗi ngày."
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-950/60 cursor-pointer">
                        <div>
                          <div className="text-sm font-medium text-stone-800 dark:text-zinc-200">
                            Hiển thị 3 thẻ thống kê trên trang chủ
                          </div>
                          <div className="text-xs text-stone-500 dark:text-zinc-400">
                            Số bài đã xuất bản, số dự án và chuỗi ngày viết liên tiếp
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileDraft.showStats !== false}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, showStats: e.target.checked })
                          }
                          className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                        />
                      </label>
                    </div>

                    {/* Nhóm 2: Hồ sơ tác giả & Liên kết */}
                    <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-zinc-800">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
                        2. Hồ sơ tác giả & Liên kết liên hệ
                      </h3>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Tên tác giả
                        </label>
                        <input
                          type="text"
                          value={profileDraft.authorName || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, authorName: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                          Giới thiệu bản thân (để trống để ẩn)
                        </label>
                        <textarea
                          rows={4}
                          value={profileDraft.bio || ''}
                          onChange={(e) =>
                            setProfileDraft({ ...profileDraft, bio: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Số điện thoại / Hotline (để trống để ẩn)
                          </label>
                          <input
                            type="tel"
                            value={profileDraft.phone || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, phone: e.target.value })
                            }
                            placeholder="VD: 0912345678"
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Số điện thoại hoặc Link Zalo (để trống để ẩn)
                          </label>
                          <input
                            type="text"
                            value={profileDraft.zalo || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, zalo: e.target.value })
                            }
                            placeholder="VD: 0912345678 hoặc https://zalo.me/..."
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Link Facebook (để trống để ẩn)
                          </label>
                          <input
                            type="url"
                            value={profileDraft.facebook || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, facebook: e.target.value })
                            }
                            placeholder="https://facebook.com/ten-cua-ban"
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Link GitHub (để trống để ẩn)
                          </label>
                          <input
                            type="url"
                            value={profileDraft.github || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, github: e.target.value })
                            }
                            placeholder="https://github.com/..."
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Website cá nhân (để trống để ẩn)
                          </label>
                          <input
                            type="url"
                            value={profileDraft.website || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, website: e.target.value })
                            }
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-500 dark:text-zinc-400 mb-1">
                            Email liên hệ (để trống để ẩn)
                          </label>
                          <input
                            type="email"
                            value={profileDraft.email || ''}
                            onChange={(e) =>
                              setProfileDraft({ ...profileDraft, email: e.target.value })
                            }
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>

        {/* CHÂN TRANG */}
        <footer className="mt-16 border-t border-stone-200/80 dark:border-zinc-800/80 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-zinc-500">
            <div className="flex items-center gap-2">
              <TlapLogoMark className="w-4 h-4 text-stone-900 dark:text-zinc-100 shrink-0" />
              <span>
                © {new Date().getFullYear()} {profile.blogName}
                {profile.footerText ? ` — ${profile.footerText}` : ''}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {buildZaloHref(profile.zalo) && (
                <a
                  href={buildZaloHref(profile.zalo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#0068FF] dark:text-sky-400 hover:underline"
                >
                  <ZaloIcon className="w-3.5 h-3.5" />
                  <span>Zalo</span>
                </a>
              )}
              {profile.facebook && (
                <a
                  href={profile.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#1877F2] dark:text-blue-400 hover:underline"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              )}
              {(buildZaloHref(profile.zalo) || profile.facebook) && <span>•</span>}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất Admin</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="inline-flex items-center gap-1 hover:text-stone-900 dark:hover:text-zinc-200 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đăng nhập Admin</span>
                </button>
              )}
            </div>
          </div>
        </footer>

        {/* NÚT CUỘN NHANH LÊN ĐẦU TRANG */}
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Lên đầu trang"
            title="Lên đầu trang"
            className="fixed bottom-5 left-5 z-40 p-2.5 rounded-full border border-stone-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 text-stone-700 dark:text-zinc-300 shadow-md hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        {/* CỤM NÚT LIÊN HỆ NỔI GÓC PHẢI DƯỚI (ẨN KHI ĐANG SOẠN BÀI) */}
        {view !== 'editor' && <FloatingContactWidget profile={profile} />}

        {/* HỘP THOẠI ĐĂNG NHẬP / THIẾT LẬP ADMIN */}
        <AdminAuthModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          adminConfig={adminConfig}
          isProductionAuth={!IS_PREVIEW_ENV && Boolean(auth)}
          onSetup={handleAdminSetup}
          onLogin={handleAdminLogin}
        />

        {/* HỘP THOẠI XÁC NHẬN XÓA */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 dark:text-zinc-50">
                    Xóa bài viết này?
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-zinc-400">
                    Bài viết <strong className="text-stone-800 dark:text-zinc-200">"{deleteTarget.title}"</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDeletePost}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX PHÓNG TO ẢNH KHI ĐỌC */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              aria-label="Đóng ảnh phóng to"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt || 'Ảnh phóng to'}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-default"
            />
            {lightboxImage.alt && (
              <p className="mt-3 text-sm text-stone-300 text-center max-w-2xl">
                {lightboxImage.alt}
              </p>
            )}
          </div>
        )}

        {/* THÔNG BÁO TOAST */}
        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border bg-stone-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-stone-800 dark:border-zinc-200 text-sm font-medium whitespace-nowrap">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}