export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant py-16 px-4">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="text-headline-md font-bold bg-gradient-to-r from-[#7B1FA2] via-[#C2185B] to-[#F4511E] bg-clip-text text-transparent">
                ClearClaim
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Securing the future of high-value digital transactions with precision-grade AI verification.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h5 className="text-label-md uppercase tracking-widest text-on-surface mb-6">Product</h5>
              <ul className="space-y-4 text-body-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Integrations</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-label-md uppercase tracking-widest text-on-surface mb-6">Company</h5>
              <ul className="space-y-4 text-body-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-label-md uppercase tracking-widest text-on-surface mb-6">Social</h5>
              <ul className="space-y-4 text-body-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-label-md text-on-surface-variant">© 2024 ClearClaim. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">language</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">support</span>
          </div>
        </div>
      </div>
    </footer>
  )
}