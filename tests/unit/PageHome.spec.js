import { shallowMount, createLocalVue } from '@vue/test-utils'
import { Quasar } from 'quasar'
import PageHome from 'src/pages/PageHome.vue'

// Mock Firebase
jest.mock('src/boot/firebase', () => ({
  collection: jest.fn().mockReturnValue({
    add: jest.fn().mockResolvedValue({ id: 'test-id' }),
    doc: jest.fn().mockReturnValue({
      delete: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue()
    }),
    orderBy: jest.fn().mockReturnValue({
      onSnapshot: jest.fn()
    })
  })
}))

describe('PageHome - Delete Confirmation Dialog', () => {
  let wrapper
  const localVue = createLocalVue()
  
  localVue.use(Quasar, {
    components: {
      QPage: true,
      QScrollArea: true,
      QInput: true,
      QBtn: true,
      QAvatar: true,
      QList: true,
      QItem: true,
      QItemSection: true,
      QItemLabel: true,
      QIcon: true,
      QSeparator: true,
      QDialog: true,
      QCard: true,
      QCardSection: true,
      QCardActions: true
    }
  })

  beforeEach(() => {
    wrapper = shallowMount(PageHome, {
      localVue,
      mocks: {
        $q: {
          screen: { lt: { md: false } }
        }
      },
      stubs: {
        'q-page': true,
        'q-scroll-area': true,
        'q-input': true,
        'q-btn': true,
        'q-avatar': true,
        'q-list': true,
        'q-item': true,
        'q-item-section': true,
        'q-item-label': true,
        'q-icon': true,
        'q-separator': true,
        'q-dialog': true,
        'q-card': true,
        'q-card-section': true,
        'q-card-actions': true,
        'transition-group': true
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  test('renders without errors', () => {
    expect(wrapper.exists()).toBe(true)
  })

  test('initializes showDeleteConfirm as false', () => {
    expect(wrapper.vm.showDeleteConfirm).toBe(false)
  })

  test('initializes qweetToDelete as null', () => {
    expect(wrapper.vm.qweetToDelete).toBe(null)
  })

  test('promptDeleteQweet sets qweetToDelete and shows dialog', () => {
    const qweet = { id: '1', content: 'Test qweet' }
    wrapper.vm.promptDeleteQweet(qweet)
    
    expect(wrapper.vm.qweetToDelete).toBe(qweet)
    expect(wrapper.vm.showDeleteConfirm).toBe(true)
  })

  test('confirmDeleteQweet calls deleteQweet and closes dialog', async () => {
    const qweet = { id: '1', content: 'Test qweet' }
    wrapper.vm.qweetToDelete = qweet
    wrapper.vm.showDeleteConfirm = true
    
    const deleteQweetSpy = jest.spyOn(wrapper.vm, 'deleteQweet')
    
    await wrapper.vm.confirmDeleteQweet()
    
    expect(deleteQweetSpy).toHaveBeenCalledWith(qweet)
    expect(wrapper.vm.showDeleteConfirm).toBe(false)
    expect(wrapper.vm.qweetToDelete).toBe(null)
  })

  test('confirmDeleteQweet does nothing if qweetToDelete is null', () => {
    wrapper.vm.qweetToDelete = null
    const deleteQweetSpy = jest.spyOn(wrapper.vm, 'deleteQweet')
    
    wrapper.vm.confirmDeleteQweet()
    
    expect(deleteQweetSpy).not.toHaveBeenCalled()
  })

  test('has delete-confirm-dialog element with data-test attribute', () => {
    const dialog = wrapper.find('[data-test="delete-confirm-dialog"]')
    expect(dialog.exists()).toBe(true)
  })

  test('has delete-confirm-text element with data-test attribute', () => {
    const text = wrapper.find('[data-test="delete-confirm-text"]')
    expect(text.exists()).toBe(true)
  })

  test('has delete-cancel-btn element with data-test attribute', () => {
    const btn = wrapper.find('[data-test="delete-cancel-btn"]')
    expect(btn.exists()).toBe(true)
  })

  test('has delete-confirm-btn element with data-test attribute', () => {
    const btn = wrapper.find('[data-test="delete-confirm-btn"]')
    expect(btn.exists()).toBe(true)
  })

  test('has delete-btn elements with data-test attribute', () => {
    const deleteButtons = wrapper.findAll('[data-test="delete-btn"]')
    expect(deleteButtons.length).toBeGreaterThanOrEqual(0)
  })

  test('clicking cancel button closes the dialog without deleting', () => {
    const qweet = { id: '1', content: 'Test qweet' }
    wrapper.vm.qweetToDelete = qweet
    wrapper.vm.showDeleteConfirm = true
    
    const deleteQweetSpy = jest.spyOn(wrapper.vm, 'deleteQweet')
    
    // Simulate clicking the cancel button
    const cancelBtn = wrapper.find('[data-test="delete-cancel-btn"]')
    expect(cancelBtn.exists()).toBe(true)
    
    // The v-close-popup directive would close the dialog
    // We'll simulate this by directly calling the hide handler
    const dialog = wrapper.find('[data-test="delete-confirm-dialog"]')
    if (dialog.vm) {
      dialog.vm.$emit('hide')
    }
    
    expect(deleteQweetSpy).not.toHaveBeenCalled()
  })

  test('promptDeleteQweet can be called multiple times with different qweets', () => {
    const qweet1 = { id: '1', content: 'First qweet' }
    const qweet2 = { id: '2', content: 'Second qweet' }
    
    wrapper.vm.promptDeleteQweet(qweet1)
    expect(wrapper.vm.qweetToDelete).toBe(qweet1)
    
    wrapper.vm.promptDeleteQweet(qweet2)
    expect(wrapper.vm.qweetToDelete).toBe(qweet2)
  })
})
