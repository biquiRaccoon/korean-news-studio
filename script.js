// Korean News Studio - JavaScript

// 검색 및 필터 상태 관리
let searchState = {
  keyword: '',
  level: '1',
  department: '',
  sortBy: 'time-desc', // 기본값: 최신순 (내림차순)
  currentPage: 1
};

// 페이지네이션 설정
const ITEMS_PER_PAGE = 9;

// 다크모드 상태 관리
let isDarkMode = true;

// 필터 칩 토글 기능
document.addEventListener('DOMContentLoaded', function() {
  const chips = document.querySelectorAll('.chip');
  
  chips.forEach(chip => {
    chip.addEventListener('click', function() {
      const isPressed = this.getAttribute('aria-pressed') === 'true';
      
      // 같은 그룹 내에서 하나만 선택되도록 (난이도 필터의 경우)
      const group = this.closest('[role="group"]');
      if (group) {
        group.querySelectorAll('.chip').forEach(c => {
          c.setAttribute('aria-pressed', 'false');
        });
        this.setAttribute('aria-pressed', 'true');
        
        // 난이도 업데이트
        const levelText = this.textContent.trim();
        searchState.level = levelText.replace('Level ', '');
        searchState.currentPage = 1; // 필터 변경 시 첫 페이지로
        applyFilters();
      } else {
        // 주제 필터는 다중 선택 가능
        this.setAttribute('aria-pressed', isPressed ? 'false' : 'true');
      }
    });
  });

  // 키워드 검색 기능
  const searchInput = document.querySelector('.search');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      const keyword = e.target.value.trim();
      searchState.keyword = keyword;
      
      // 입력 후 300ms 대기 (디바운싱)
      searchTimeout = setTimeout(() => {
        searchState.currentPage = 1; // 검색 시 첫 페이지로
        applyFilters();
      }, 300);
    });
    
    // Enter 키로 즉시 검색
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        searchState.currentPage = 1; // 검색 시 첫 페이지로
        applyFilters();
      }
    });
  }

  // 부처별 필터
  const departmentFilter = document.getElementById('department-filter');
  if (departmentFilter) {
    departmentFilter.addEventListener('change', function(e) {
      searchState.department = e.target.value;
      searchState.currentPage = 1; // 필터 변경 시 첫 페이지로
      applyFilters();
    });
  }

  // 시간 정렬 토글 기능
  const timeSortBtn = document.getElementById('time-sort-btn');
  
  function updateTimeSortButton() {
    if (timeSortBtn) {
      const arrow = timeSortBtn.querySelector('.sort-arrow');
      if (arrow) {
        // 내림차순: ↓ (최신순), 오름차순: ↑ (오래된순)
        arrow.textContent = searchState.sortBy === 'time-desc' ? '↓' : '↑';
      }
    }
  }
  
  if (timeSortBtn) {
    updateTimeSortButton();
    
    timeSortBtn.addEventListener('click', function() {
      // 오름차순/내림차순 토글
      if (searchState.sortBy === 'time-desc') {
        searchState.sortBy = 'time-asc';
      } else {
        searchState.sortBy = 'time-desc';
      }
      searchState.currentPage = 1; // 정렬 변경 시 첫 페이지로
      updateTimeSortButton();
      applyFilters();
    });
  }

  // 다크모드 토글
  const themeToggle = document.getElementById('theme-toggle');
  function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = isDarkMode ? '🌙' : '☀️';
    }
  }
  
  if (themeToggle) {
    // 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      isDarkMode = false;
      document.body.classList.add('light-mode');
    }
    updateThemeIcon();

    themeToggle.addEventListener('click', function() {
      isDarkMode = !isDarkMode;
      if (isDarkMode) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
      updateThemeIcon();
    });
  }

  // 읽기 버튼 클릭 이벤트
  const readButtons = document.querySelectorAll('.cta');
  readButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 읽기 페이지로 이동하는 로직은 추후 구현
      console.log('읽기 버튼 클릭');
    });
  });

  // 페이지네이션 버튼 이벤트
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (searchState.currentPage > 1) {
        searchState.currentPage--;
        applyFilters();
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      // applyFilters에서 totalPages를 계산하므로 여기서는 단순히 증가
      searchState.currentPage++;
      applyFilters();
      // 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 초기 필터 적용 (Level 1이 기본 선택되어 있으므로)
  applyFilters();
});

// 페이지네이션 UI 업데이트 함수
function updatePagination(totalItems, totalPages) {
  const pagination = document.getElementById('pagination');
  const paginationPages = document.getElementById('pagination-pages');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (!pagination || !paginationPages) return;

  // 9개 이하면 페이지네이션 숨김
  if (totalItems <= ITEMS_PER_PAGE) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';

  // 이전/다음 버튼 활성화 상태
  if (prevBtn) {
    prevBtn.disabled = searchState.currentPage === 1;
    prevBtn.style.opacity = searchState.currentPage === 1 ? '0.4' : '1';
    prevBtn.style.cursor = searchState.currentPage === 1 ? 'not-allowed' : 'pointer';
  }

  if (nextBtn) {
    nextBtn.disabled = searchState.currentPage === totalPages;
    nextBtn.style.opacity = searchState.currentPage === totalPages ? '0.4' : '1';
    nextBtn.style.cursor = searchState.currentPage === totalPages ? 'not-allowed' : 'pointer';
  }

  // 페이지 번호 생성
  paginationPages.innerHTML = '';
  
  // 최대 5개의 페이지 번호 표시
  let startPage = Math.max(1, searchState.currentPage - 2);
  let endPage = Math.min(totalPages, searchState.currentPage + 2);

  // 시작 페이지 조정
  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4);
    }
  }

  // 첫 페이지
  if (startPage > 1) {
    const firstBtn = createPageButton(1);
    paginationPages.appendChild(firstBtn);
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      paginationPages.appendChild(ellipsis);
    }
  }

  // 페이지 번호 버튼들
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createPageButton(i);
    paginationPages.appendChild(pageBtn);
  }

  // 마지막 페이지
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      paginationPages.appendChild(ellipsis);
    }
    const lastBtn = createPageButton(totalPages);
    paginationPages.appendChild(lastBtn);
  }
}

// 페이지 번호 버튼 생성 함수
function createPageButton(pageNum) {
  const button = document.createElement('button');
  button.className = 'pagination-page';
  button.textContent = pageNum;
  
  if (pageNum === searchState.currentPage) {
    button.classList.add('active');
  }
  
  button.addEventListener('click', function() {
    searchState.currentPage = pageNum;
    applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  return button;
}

// 필터 및 검색 적용 함수
function applyFilters() {
  const grid = document.querySelector('.grid');
  const allCards = Array.from(document.querySelectorAll('.card'));
  let visibleCards = [];

  // 필터링
  allCards.forEach(card => {
    let shouldShow = true;

    // 키워드 검색
    if (searchState.keyword) {
      const keywords = card.getAttribute('data-keywords') || '';
      const title = card.querySelector('.title')?.textContent || '';
      const desc = card.querySelector('.desc')?.textContent || '';
      const searchText = (keywords + ' ' + title + ' ' + desc).toLowerCase();
      const keywordLower = searchState.keyword.toLowerCase();
      
      if (!searchText.includes(keywordLower)) {
        shouldShow = false;
      }
    }

    // 난이도 필터
    if (searchState.level) {
      const cardLevel = card.getAttribute('data-level');
      if (cardLevel !== searchState.level) {
        shouldShow = false;
      }
    }

    // 부처 필터
    if (searchState.department) {
      const cardDepartment = card.getAttribute('data-department');
      if (cardDepartment !== searchState.department) {
        shouldShow = false;
      }
    }

    if (shouldShow) {
      visibleCards.push(card);
    }
  });

  // 정렬 적용
  sortCards(visibleCards);

  // 페이지네이션 처리
  const totalPages = Math.ceil(visibleCards.length / ITEMS_PER_PAGE);
  
  // 현재 페이지가 유효한 범위인지 확인
  if (searchState.currentPage > totalPages && totalPages > 0) {
    searchState.currentPage = totalPages;
  } else if (searchState.currentPage < 1) {
    searchState.currentPage = 1;
  }

  // 현재 페이지에 표시할 카드 계산
  const startIndex = (searchState.currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const cardsToShow = visibleCards.slice(startIndex, endIndex);

  // DOM 업데이트: 모든 카드를 제거하고 정렬된 카드만 다시 추가
  const noResultsMsg = document.getElementById('no-results');
  if (noResultsMsg) {
    noResultsMsg.remove();
  }

  // 기존 카드 제거 (no-results 메시지 제외)
  allCards.forEach(card => {
    card.remove();
  });

  // 현재 페이지의 카드만 추가
  cardsToShow.forEach(card => {
    grid.appendChild(card);
  });

  // 결과가 없을 때 메시지 표시
  if (visibleCards.length === 0) {
    const msg = document.createElement('div');
    msg.id = 'no-results';
    msg.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--muted);';
    msg.textContent = '검색 결과가 없습니다. 다른 키워드나 필터를 시도해보세요.';
    grid.appendChild(msg);
  }

  // 페이지네이션 UI 업데이트
  updatePagination(visibleCards.length, totalPages);
}

// 카드 정렬 함수
function sortCards(cards) {
  switch (searchState.sortBy) {
    case 'time-desc':
      // 시간별 정렬 (최신 것부터 - 내림차순)
      cards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateB - dateA;
      });
      break;

    case 'time-asc':
      // 시간별 정렬 (오래된 것부터 - 오름차순)
      cards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateA - dateB;
      });
      break;
  }
}
