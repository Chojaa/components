const ANIMATION_END_EVENTS = ['oAnimationEnd', 'MSAnimationEnd', 'animationend'];

window.WSDropdown = Polymer({
    is: 'ws-dropdown',

    properties: {
        items: {
            type: Array,
            readOnly: false,
            notify: false
        },
        enrichedItems: {
            type: Array,
            computed: 'enrichItems(items)'
        },
        noTrigger: {
            type: Boolean,
            value: false
        },
        multiple: {
            type: Boolean,
            value: false
        },
        filterable: {
            type: Boolean,
            value: false
        },
        value: {
            type: Object,
            readOnly: false,
            notify: true
        },
        orientation: {
            type: String,
            readOnly: false,
            notify: false,
            value: 'left'
        },
        containerClass: {
            type: String,
            computed: 'getContainerClass(orientation)'
        }
    },

    enrichItems(items) {
        // If items is just a list of strings convert the strings to objects with label property
        return items.map(item => {
            let enriched = typeof item === 'object' ? item : {label: item};
            if (enriched.children) {
                enriched.children = this.enrichItems(enriched.children);
            }
            return enriched;
        });
    },

    getContainerClass(orientation) {
        return `dropdown-container ${orientation}`;
    },

    attached() {
        // Prevent binding events multiple times on de- and attach
        if (!this.isReady) {
            this.onDocumentClick = this.onDocumentClick.bind(this);
            this.grabElements();
            this.setupListeners();
            this.adjustSize(this.dropdownMenu);
            this.isReady = true;
        }
    },

    grabElements() {
        this.dropdownContainer = this.$$('.dropdown-container');
        this.dropdownMenu = this.$$('ws-dropdown-menu');
        this.button = this.getEffectiveChildren()[0];
        // Check if either a button is projected or the no-trigger flag is set
        if (!this.button && !this.noTrigger) {
            throw new Error('No button found and no-trigger attribute is missing. '
                + 'Either you add a element to the dropdown children matching this query `button,a,.button,.select-box,.target-element`, '
                + 'or you add the `no-trigger` attribute to the dropdown.')
        }
    },

    setupListeners() {
        let stop = event => {
            event.stopPropagation();
            event.preventDefault();
        };
        this.dropdownMenu.addEventListener('change-size', event => {
            stop(event);
            this.adjustSize(event.detail.height);
        });
        // this event will bubble up to the listener outside
        this.dropdownMenu.addEventListener('change', event => {
            this.value = event.detail;
            this.isOpen ? this.close() : this.open();
        });
        this.dropdownMenu.addEventListener('click', event => {
            stop(event);
            this.isOpen && this.close();
        });
        if (!this.noTrigger) {
            this.button.addEventListener('click', event => {
                stop(event);
                this.isOpen ? this.close() : this.open();
            });
        }
        this.addEventListener('open', () => this.open());
        this.addEventListener('close', () => this.close());
    },

    onDocumentClick(event) {
        // Close the dropdown if the click was not inside
        if (!this.contains(event.target)) {
            this.close();
        }
    },

    open() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        this.dropdownContainer.style.height = 0;
        this.dropdownContainer.classList.add('mod-open');
        this.adjustSize(this.dropdownMenu.getHeight());
        document.addEventListener('click', this.onDocumentClick, true);
    },

    /**
     * Hide the drop down on clicking outside of dropdown
     */
    close() {
        if (!this.isOpen) {
            return;
        }
        this.isOpen = false;
        this.animateElement(this.dropdownContainer, 'animate-close', container => {
            container.classList.remove('mod-open');
            // If this a multi select dropdown abort
            if (this.multiple) {
                this.dropdownMenu.clearSelections();
            }
        });
        document.removeEventListener('click', this.onDocumentClick, true);
    },

    adjustSize(newSize) {
        this.dropdownContainer.style.height = newSize + 'px';
    },

    animateElement(item, animationClass, callback) {
        // Define callback for animation end events
        let getEventHandler = eventName => {
            let eventHandler = () => {
                item.classList.remove(animationClass);
                item.removeEventListener(eventName, eventHandler);
                callback(item);
            };
            return eventHandler;
        };
        // Listen for all possible animation end events
        for (let eventName of ANIMATION_END_EVENTS) {
            item.addEventListener(eventName, getEventHandler(eventName));
        }
        // Add class to start animation
        item.classList.add(animationClass);
    }
});
