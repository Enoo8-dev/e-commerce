import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  // Riferimenti ai contenitori dei caroselli
  @ViewChild('featuredCarousel') featuredCarousel!: ElementRef<HTMLDivElement>;
  @ViewChild('offersCarousel') offersCarousel!: ElementRef<HTMLDivElement>;
  @ViewChild('newestCarousel') newestCarousel!: ElementRef<HTMLDivElement>;

  // Stato per "Prodotti in Evidenza"
  featuredProducts: Product[] = [];
  isLoadingFeatured = true;
  showDiscoverMoreCard = false;
  currentFeaturedPage = 0;
  featuredItemsPerPage = 4;
  featuredTotalPages = 0;
  private readonly featuredProductsLimit = 8;
  
  // Stato per "Ultime Offerte"
  latestOffers: Product[] = [];
  isLoadingOffers = true;
  currentOffersPage = 0;
  offersItemsPerPage = 2;
  offersTotalPages = 0;
  private readonly offersLimit = 4;

  // Stato per "Nuovi Arrivi"
  newestProducts: Product[] = [];
  isLoadingNewest = true;
  showDiscoverMoreNewest = false;
  currentNewestPage = 0;
  newestItemsPerPage = 4;
  newestTotalPages = 0;
  private readonly newestProductsLimit = 8;

  private langChangeSub!: Subscription;
  private observers: Map<string, IntersectionObserver> = new Map();

  constructor(
    private productService: ProductService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchAllData();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.fetchAllData();
    });
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObservers();
  }

  fetchAllData(): void {
    this.fetchFeaturedProducts();
    this.fetchLatestOffers();
    this.fetchNewestProducts();
  }

  fetchFeaturedProducts(): void {
    this.isLoadingFeatured = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.productService.getFeaturedProducts(lang, this.featuredProductsLimit).subscribe({
      next: (data) => {
        this.featuredProducts = data;
        this.showDiscoverMoreCard = data.length === this.featuredProductsLimit;
        this.featuredTotalPages = Math.ceil((this.featuredProducts.length + (this.showDiscoverMoreCard ? 1 : 0)) / this.featuredItemsPerPage);
        this.isLoadingFeatured = false;
        this.cdr.detectChanges();
        this.setupIntersectionObservers();
      },
      error: (err) => {
        console.error('Failed to load featured products', err);
        this.isLoadingFeatured = false;
      }
    });
  }

  fetchLatestOffers(): void {
    this.isLoadingOffers = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.productService.getLatestOffers(lang, this.offersLimit).subscribe({
      next: (data) => {
        this.latestOffers = data;
        this.offersTotalPages = Math.ceil(this.latestOffers.length / this.offersItemsPerPage);
        this.isLoadingOffers = false;
        this.cdr.detectChanges();
        this.setupIntersectionObservers();
      },
      error: (err) => {
        console.error('Failed to load latest offers', err);
        this.isLoadingOffers = false;
      }
    });
  }

  fetchNewestProducts(): void {
    this.isLoadingNewest = true;
    const lang = this.translate.currentLang || this.translate.defaultLang;
    this.productService.getNewestProducts(lang, this.newestProductsLimit).subscribe({
      next: (data) => {
        this.newestProducts = data;
        this.showDiscoverMoreNewest = data.length === this.newestProductsLimit;
        this.newestTotalPages = Math.ceil((this.newestProducts.length + (this.showDiscoverMoreNewest ? 1 : 0)) / this.newestItemsPerPage);
        this.isLoadingNewest = false;
        this.cdr.detectChanges();
        this.setupIntersectionObservers();
      },
      error: (err) => {
        console.error('Failed to load newest products', err);
        this.isLoadingNewest = false;
      }
    });
  }

  goToPage(carousel: 'featured' | 'offers' | 'newest', pageIndex: number): void {
    let container: HTMLElement;
    let itemsPerPage: number;

    if (carousel === 'featured') {
      container = this.featuredCarousel.nativeElement;
      itemsPerPage = this.featuredItemsPerPage;
      this.currentFeaturedPage = pageIndex;
    } else if (carousel === 'offers') {
      container = this.offersCarousel.nativeElement;
      itemsPerPage = this.offersItemsPerPage;
      this.currentOffersPage = pageIndex;
    } else {
      container = this.newestCarousel.nativeElement;
      itemsPerPage = this.newestItemsPerPage;
      this.currentNewestPage = pageIndex;
    }
    
    const card = container.querySelector('.carousel-item') as HTMLElement;
    if (!card) return;
    
    const cardWidth = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(container).gap || '0', 10);
    const scrollAmount = (cardWidth + gap) * (pageIndex * itemsPerPage);
    
    container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
  }

  setupIntersectionObservers() {
    this.observers.forEach(observer => observer.disconnect());

    if (this.featuredCarousel) {
      this.observers.set('featured', this.createObserver(this.featuredCarousel.nativeElement, 'featured'));
      this.featuredCarousel.nativeElement.querySelectorAll('.carousel-item').forEach(card => this.observers.get('featured')?.observe(card));
    }
    if (this.offersCarousel) {
      this.observers.set('offers', this.createObserver(this.offersCarousel.nativeElement, 'offers'));
      this.offersCarousel.nativeElement.querySelectorAll('.carousel-item').forEach(card => this.observers.get('offers')?.observe(card));
    }
    if (this.newestCarousel) {
      this.observers.set('newest', this.createObserver(this.newestCarousel.nativeElement, 'newest'));
      this.newestCarousel.nativeElement.querySelectorAll('.carousel-item').forEach(card => this.observers.get('newest')?.observe(card));
    }
  }

  createObserver(container: HTMLElement, carouselType: 'featured' | 'offers' | 'newest'): IntersectionObserver {
    const options = { root: container, rootMargin: '0px', threshold: 0.5 };
    return new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const index = parseInt(element.dataset['index'] || '0', 10);
          
          if (carouselType === 'featured') {
            this.currentFeaturedPage = Math.floor(index / this.featuredItemsPerPage);
          } else if (carouselType === 'offers') {
            this.currentOffersPage = Math.floor(index / this.offersItemsPerPage);
          } else if (carouselType === 'newest') {
            this.currentNewestPage = Math.floor(index / this.newestItemsPerPage);
          }

          this.cdr.detectChanges();
          return;
        }
      }
    }, options);
  }

  encodeURIComponent(arg0: string) {
    return encodeURIComponent(arg0);
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) this.langChangeSub.unsubscribe();
    this.observers.forEach(observer => observer.disconnect());
  }
}