using AutoMapper;
using StockSenseAI.Core.DTOs;
using StockSenseAI.Core.Entities;

namespace StockSenseAI.Api;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<ProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.SalesHistories, opt => opt.Ignore());

        CreateMap<Product, ProductDto>();
    }
}
