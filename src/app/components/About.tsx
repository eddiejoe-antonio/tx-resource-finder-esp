import Image from 'next/image';
import aboutAsset from '../../../public/ResourceFinder.jpg';

const About = () => (
  <div className="flex flex-wrap py-10">
    {/* Text Section */}
    <div className="w-full lg:w-1/2 py-6  pr-6">
      <h3 className="font-semibold text-[1.8rem] subpixel-antialiased">
        About the Resource Finder
      </h3>
      <p className="py-3 text-md text-black">
        Looking for organizations or local governments providing digital resources like free Wi-Fi
        access, digital skills class, or devices? The Texas Digital Opportunity Resource Hub can
        help anyone find digital opportunity resources.
      </p>
      <p className="text-black">
        The information in the Resource Finder comes from a survey that the BDO circulated to Texas
        agencies and organizations working to advance digital opportunity. Because this information
        is crowdsourced, it may not be 100% complete. We invite you to help keep the information up
        to date and as comprehensive as possible.
      </p>
      <div className="pt-6">
        <h3 className="font-semibold text-[1.8rem] subpixel-antialiased py-4">
          What Makes the Resource Finder Unique
        </h3>
        <p className="py-2 text-black">
          On this site, Texans can find the resources they need within their communities or learn
          about what organizations in other parts of the state are doing. It is a work in progress
          that will expand as people interested in advancing digital opportunity add information. In
          this way, the Resource Finder is a unique, crowdsourced dataset that helps the BDO deliver
          on its commitment to maintaining a living digital opportunity plan for all Texans.
        </p>
        <h3 className="font-semibold text-[1.8rem] subpixel-antialiased py-4">
          Contributing to the Resource Finder
        </h3>
        <p className="text-black">
          The DRMTS was widely disseminated over a four-month period, from April to August 2023, and
          leveraged the BDO public engagement model to reach state, county and local agencies,
          councils of governments (COGs), CBOs, nonprofits, faith-based groups, CAIs and private
          sector companies. The BDO conducted desktop research to supplement survey responses with
          publicly available information on organizations.
        </p>
        <p className="pt-2 text-black">
          However, not every digital resource is represented by this dataset. The BDO welcomes your
          continued engagement on the task of gathering resources across the state. If you are aware
          of a digital resource that is not listed on this site, you are welcome to submit it for
          review at the link at the top of this page.
        </p>
      </div>
    </div>

    {/* Image Section */}
    <div className="w-full lg:w-1/2 py-6 pl-6">
      <div className="relative w-full h-64 lg:h-full shadow-md">
        <Image
          src={aboutAsset}
          alt="Resource Finder overview"
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
    </div>
  </div>
);

export default About;
