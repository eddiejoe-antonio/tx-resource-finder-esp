import Image from 'next/image';
import aboutAsset from '../../../public/ResourceFinder.jpg';

const About = () => (
  <div className="flex flex-wrap pt-10">
    {/* Text Section */}
    <div className="w-full lg:w-1/2 pt-6  pr-6">
      <h3 className="font-semibold text-[1.8rem] subpixel-antialiased">
      Acerca del buscador de recursos
      </h3>
      <p className="py-3 text-md text-black">
      ¿Busca organizaciones o gobiernos locales que brinden recursos digitales, como acceso a Wifi gratis, clases de habilidades digitales o dispositivos? El Centro de Recursos de Oportunidad Digital de Texas puede ayudar a cualquier persona a buscar recursos de oportunidad digital.
      </p>
      <p className="text-black">
      La información del buscador de recursos proviene de una encuesta que la BDO distribuyó a las agencias y organizaciones de Texas que trabajan para mejorar la oportunidad digital. Dado que esta información es de origen público, podría no estar 100 % completa. Lo invitamos a mantener la información actualizada y lo más exhaustiva posible.
      </p>
      <div className="pt-6">
        <h3 className="font-semibold text-[1.8rem] subpixel-antialiased py-4">
        ¿Qué hace que el buscador de recursos sea único?
        </h3>
        <p className="py-2 text-black">
        En este sitio, los texanos pueden buscar los recursos que necesitan dentro de sus comunidades o conocer qué están haciendo las organizaciones de otras partes del estado. Es un trabajo en proceso que se expandirá a medida que las personas interesadas en mejorar la oportunidad agregan información. En este sentido, el buscador de recursos es un conjunto de datos único de origen público que ayuda a la BDO a lograr su compromiso de mantener un plan de oportunidad digital activo para todos los texanos.
        </p>
        <h3 className="font-semibold text-[1.8rem] subpixel-antialiased py-4">
        Contribuir al buscador de recursos
        </h3>
        <p className="text-black">
        La DRMTS se difundió ampliamente en un período de cuatro meses, de abril a agosto de 2023, y aprovechó el modelo de participación pública de la BDO para llegar a agencias estatales, provinciales y locales, concejos de gobiernos (COG), CBO, organizaciones sin fines de lucro, grupos religiosos, CAI y empresas del sector privado. La BDO llevó a cabo una investigación secundaria para complementar las respuestas de la encuesta con información disponible públicamente sobre las organizaciones.
        </p>
        <p className="pt-2 text-black">
        Sin embargo, no todos los recursos digitales están representados en este conjunto de datos. La BDO agradece su continua participación en la tarea de reunir recursos en todo el estado. Si sabe de algún recurso digital que no está enumerado en este sitio, puede enviarlo para revisión en el siguiente enlace.
        </p>
      </div>
    </div>

    {/* Image Section */}
    <div className="w-full lg:w-1/2 pt-6 md:pl-6">
      <div className="relative w-full h-96 lg:h-full shadow-md">
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
