/* ==========================================================================
   NexusN — 공통 스크립트
   헤더/푸터를 한 곳에서 렌더링하므로 메뉴 수정은 이 파일의 NAV만 고치면
   모든 페이지에 반영됩니다.
   ========================================================================== */

(function () {
  "use strict";

  var ROOT = document.body.getAttribute("data-root") || "./";
  var SITE_THEME = "v8-2";
  var THEME_QS = "";
  /* 상세페이지 종류를 body class로 노출해 페이지별 구성요소도 시안 테마에 맞춤 */
  var detailMatch = location.pathname.match(/\/(about|services|recruit|board)\/([^/?#]+)\.html$/);
  if (detailMatch) {
    document.body.classList.add("detail-page", "detail-" + detailMatch[1], "page-" + detailMatch[2]);
  }
  /* 테마 CSS 주입은 서브페이지에서만 — 시안 메인(/vN/)은 자기 고유 스타일 유지 */
  if (detailMatch) {
    /* 파생 시안(v8-1·v8-2)은 원본 시안(v8) 규칙을 그대로 물려받고 차이점만 덮어쓴다 */
    var baseTheme = SITE_THEME.split("-")[0];
    if (baseTheme !== SITE_THEME) document.body.classList.add("site-theme-" + baseTheme);
    document.body.classList.add("site-theme-" + SITE_THEME);
    if (!document.querySelector('link[data-subpage-themes]')) {
      var themeCss = document.createElement("link");
      themeCss.rel = "stylesheet";
      themeCss.href = ROOT + "css/subpage-themes.css?v=20260820-v82";
      themeCss.setAttribute("data-subpage-themes", "");
      document.head.appendChild(themeCss);
    }
  }
  /* 로고 클릭 시 이동할 홈 주소 (컨셉 시안별로 다른 메인을 가리킬 수 있음) */
  var HOME = ROOT + "index.html";

  /* ------------------------------------------------------------------
     메뉴 구조 (depth 1 ~ 3)
     hidden: true → 페이지는 존재하지만 메뉴에는 노출하지 않음 (예: 회사 연혁)
     ------------------------------------------------------------------ */
  var NAV = [
    {
      title: "회사소개",
      en: "About Us",
      items: [
        { label: "임직원 인사말", href: "about/greeting.html" },
        { label: "회사 개요", href: "about/overview.html" },
        { label: "비전 및 핵심가치", href: "about/vision.html" },
        { label: "WHY NexusN?", href: "about/why.html" },
        /* 회사 연혁: 페이지는 만들어 두고 메뉴에서는 숨김. 오픈 시 hidden 제거 */
        { label: "회사 연혁", href: "about/history.html", hidden: true }
      ]
    },
    {
      title: "사업소개",
      en: "Our Services",
      items: [
        { label: "도급(업무위탁)", href: "services/outsourcing.html" },
        { label: "근로자 파견", href: "services/dispatch.html" },
        { label: "HR 솔루션", href: "services/hr-solution.html" },
        { label: "채용대행", href: "services/recruiting-agency.html", depth3: true },
        { label: "헤드헌팅", href: "services/headhunting.html", depth3: true },
        { label: "인사/노무컨설팅", href: "services/consulting.html", depth3: true }
      ]
    },
    {
      title: "채용정보",
      en: "Recruitment",
      items: [
        { label: "인재상", href: "recruit/talent.html" },
        { label: "채용 프로세스", href: "recruit/process.html" },
        { label: "진행 중인 채용", href: "recruit/jobs.html" },
        { label: "인재풀 등록 (상시지원)", href: "recruit/apply.html" }
      ]
    },
    {
      title: "게시판",
      en: "Notice & News",
      items: [
        { label: "공지사항", href: "board/notice.html" },
        { label: "HR Insight", href: "board/insight.html" },
        { label: "증명서 발급 요청", href: "board/certificate.html" }
      ]
    }
  ];

  /* 현재 페이지 경로 (active 표시용) */
  var path = location.pathname.replace(/\\/g, "/");

  function isCurrent(href) {
    return path.indexOf("/" + href) !== -1 || path.slice(-href.length) === href;
  }

  function visibleItems(group) {
    return group.items.filter(function (it) { return !it.hidden; });
  }

  function renderDepthMenu(items, mobile) {
    var html = "";
    items.forEach(function (it, index) {
      if (it.depth3) return;
      var children = [];
      for (var i = index + 1; i < items.length && items[i].depth3; i += 1) children.push(items[i]);
      var active = isCurrent(it.href) ? " active" : "";
      if (!children.length) {
        html += '<a class="' + active.trim() + '" href="' + ROOT + it.href + THEME_QS + '">' + it.label + "</a>";
        return;
      }
      var childActive = children.some(function (child) { return isCurrent(child.href); });
      var childLinks = children.map(function (child) {
        return '<a class="depth3' + (isCurrent(child.href) ? " active" : "") + '" href="' + ROOT + child.href + THEME_QS + '">' + child.label + "</a>";
      }).join("");
      html += '<div class="nested-menu' + (childActive ? " open" : "") + '">' +
        '<div class="nested-head"><a class="' + active.trim() + '" href="' + ROOT + it.href + THEME_QS + '">' + it.label + '</a>' +
        '<button type="button" aria-label="' + it.label + ' 하위 메뉴 열기" aria-expanded="' + (childActive ? "true" : "false") + '"><span></span></button></div>' +
        '<div class="nested-sub">' + childLinks + "</div></div>";
    });
    return html;
  }

  /* ------------------------------------------------------------------
     헤더 렌더링
     ------------------------------------------------------------------ */
  function renderHeader() {
    var el = document.getElementById("header");
    if (!el) return;

    var gnb = NAV.map(function (group) {
      var items = visibleItems(group);
      var groupActive = items.some(function (it) { return isCurrent(it.href); });
      var dd = renderDepthMenu(items, false);
      return (
        '<li class="' + (groupActive ? "active" : "") + '">' +
        '<a href="' + ROOT + items[0].href + THEME_QS + '" data-toggle="dropdown">' + group.title + '<small>' + group.en + "</small></a>" +
        '<div class="dropdown">' + dd + "</div></li>"
      );
    }).join("");

    var mobile = NAV.map(function (group) {
      var items = visibleItems(group);
      var groupActive = items.some(function (it) { return isCurrent(it.href); });
      var sub = renderDepthMenu(items, true);
      return (
        '<div class="m-group' + (groupActive ? " open" : "") + '">' +
        "<button type=\"button\">" + group.title + '<small>' + group.en + '</small><span class="arrow"></span></button>' +
        '<div class="m-sub">' + sub + "</div></div>"
      );
    }).join("");

    /* 시안 9: 매거진 목차처럼 모든 depth를 한 화면에 보여주는 전체폭 메뉴 */
    var v9Mega = "";
    if (SITE_THEME === "v9") {
      var megaColumns = NAV.map(function (group, groupIndex) {
        var links = visibleItems(group).map(function (it) {
          return '<a class="' + (it.depth3 ? "depth3 " : "") + (isCurrent(it.href) ? "active" : "") +
            '" href="' + ROOT + it.href + THEME_QS + '">' + it.label + "</a>";
        }).join("");
        return '<section class="v9-mega-column"><p>0' + (groupIndex + 1) + ' · ' + group.en +
          '</p><h2>' + group.title + '</h2><div>' + links + "</div></section>";
      }).join("");
      v9Mega = '<div class="v9-mega-menu"><div class="container v9-mega-grid">' + megaColumns +
        '<p class="v9-mega-note">NEXUSN JOURNAL<br><b>PEOPLE &amp; BUSINESS</b></p></div></div>';
    }

    el.innerHTML =
      '<header class="site-header">' +
      '<div class="container header-inner">' +
      '<a class="logo" href="' + HOME + '"><img src="' + ROOT + 'assets/brand/nexusn-logo.svg" alt="NEXUSN"></a>' +
      '<nav aria-label="주 메뉴"><ul class="gnb">' + gnb + "</ul></nav>" +
      '<button class="nav-toggle" type="button" aria-label="메뉴 열기"><span></span><span></span><span></span></button>' +
      "</div>" + v9Mega + "</header>" +
      '<div class="mobile-nav">' + mobile + "</div>";

    /* 스크롤 시 헤더 그림자 */
    var header = el.querySelector(".site-header");
    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* 데스크톱 드롭다운 open/close (터치/클릭 대응) */
    el.querySelectorAll(".gnb > li > a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var li = a.parentElement;
        /* 첫 클릭(터치)에는 드롭다운만 열고, 열린 상태에서 다시 클릭하면 이동 */
        if (window.matchMedia("(hover: none)").matches && !li.classList.contains("open")) {
          e.preventDefault();
          el.querySelectorAll(".gnb > li.open").forEach(function (o) { o.classList.remove("open"); });
          li.classList.add("open");
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".gnb")) {
        el.querySelectorAll(".gnb > li.open").forEach(function (o) { o.classList.remove("open"); });
      }
    });

    /* 모바일 햄버거 */
    el.querySelector(".nav-toggle").addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });

    /* 모바일 아코디언 open/close */
    el.querySelectorAll(".m-group > button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        btn.parentElement.classList.toggle("open");
      });
    });

    /* HR 솔루션 등 3차 메뉴 open/close */
    el.querySelectorAll(".nested-head > button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var menu = btn.closest(".nested-menu");
        var open = menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ------------------------------------------------------------------
     푸터 렌더링
     ------------------------------------------------------------------ */
  function renderFooter() {
    var el = document.getElementById("footer");
    if (!el) return;
    el.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-top">' +
      '<a class="f-logo" href="' + HOME + '"><img src="' + ROOT + 'assets/brand/nexusn-logo.svg" alt="NEXUSN"></a>' +
      '<div class="f-links">' +
      '<a class="em" href="' + ROOT + 'legal/privacy.html' + THEME_QS + '">개인정보처리방침</a>' +
      '<a href="' + ROOT + 'legal/terms.html' + THEME_QS + '">이용약관</a>' +
      "</div></div>" +
      "<address>" +
      "주식회사 넥서스엔 &nbsp;|&nbsp; 사업자등록번호 807-87-04034<br>" +
      "주소: 서울특별시 서초구 동산로2길 40<br>" +
      'TEL: <a href="tel:02-575-5604">02-575-5604</a> &nbsp;|&nbsp; FAX: 02-575-4349 &nbsp;|&nbsp; ' +
      'E-mail: <a href="mailto:admin@nexusn.co.kr">admin@nexusn.co.kr</a>' +
      "</address>" +
      '<p class="f-license">허가번호: 근로자파견사업 2026-386 &nbsp;|&nbsp; 유료직업소개사업 제2026-3210195-14-5-00013호</p>' +
      '<p class="f-copy">Copyright © 주식회사 넥서스엔. All rights reserved.</p>' +
      "</div></footer>";
  }

  /* ------------------------------------------------------------------
     서브페이지 탭 (같은 depth1 그룹 내 이동)
     ------------------------------------------------------------------ */
  function renderPageTabs() {
    var el = document.getElementById("page-tabs");
    if (!el) return;
    var group = null;
    NAV.forEach(function (g) {
      g.items.forEach(function (it) {
        if (isCurrent(it.href)) group = g;
      });
    });
    if (!group) return;
    /* 탭에는 depth 2 항목만 노출한다. 예) 사업소개는 도급·파견·HR솔루션 3개만 두고
       채용대행·헤드헌팅·인사/노무컨설팅은 HR솔루션 하위이므로 탭에서 제외하고,
       그 하위 페이지에 들어가면 부모인 HR솔루션 탭을 활성 표시한다. */
    var items = visibleItems(group);
    var activeParent = null;
    items.forEach(function (it, i) {
      if (!it.depth3 || !isCurrent(it.href)) return;
      for (var p = i - 1; p >= 0; p -= 1) {
        if (!items[p].depth3) { activeParent = items[p]; return; }
      }
    });
    var tabs = items.filter(function (it) { return !it.depth3; }).map(function (it) {
      var active = isCurrent(it.href) || it === activeParent;
      return '<a class="' + (active ? "active" : "") + '" href="' + ROOT + it.href + THEME_QS + '">' + it.label + "</a>";
    }).join("");
    el.className = "page-tabs";
    el.innerHTML = '<div class="container"><div class="tabs-inner">' + tabs + "</div></div>";
  }

  /* ------------------------------------------------------------------
     히어로 슬라이더 (4.5초 자동 전환)
     ------------------------------------------------------------------ */
  function initSlider() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var slides = hero.querySelectorAll(".slide");
    if (slides.length < 2) return;
    var dotsWrap = hero.querySelector(".hero-dots");
    var current = 0;
    var timer = null;

    var dots = [];
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", (i + 1) + "번 슬라이드");
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    function go(i) {
      slides[current].classList.remove("current");
      dots[current].classList.remove("current");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("current");
      dots[current].classList.add("current");
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(current + 1); }, 4500);
    }
    go(0);
    restart();
  }

  /* ------------------------------------------------------------------
     스크롤 리빌
     ------------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ------------------------------------------------------------------
     숫자 카운트업 — <span data-count="10">10</span> 형태의 요소가
     화면에 들어오면 0부터 목표값까지 차오릅니다.
     ------------------------------------------------------------------ */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) return;
    function animate(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      var dur = 1300;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        /* easeOutCubic */
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animate(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { io.observe(e); });
  }

  renderHeader();
  renderFooter();
  renderPageTabs();
  initSlider();
  initReveal();
  initCounters();
})();
